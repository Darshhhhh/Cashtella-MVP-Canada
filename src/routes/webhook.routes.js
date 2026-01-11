const express = require("express");
const { supabase } = require("../services/supabase");

const {
  updateTransferStatus,
  updateTransferEconomics,
} = require("../repositories/transfer.repository");

const {
  assertValidTransition,
  TRANSFER_STATES,
} = require("../domain/transferStateMachine");

const { convertCadToStablecoin } = require("../services/bridge.service");
const { getCadToUsdRate } = require("../services/fx.service");
const {
  creditWallet,
  creditMasterWallet,
} = require("../services/ledger.service");

const router = express.Router();

const TRANSACTION_FEE_CAD = 1.99;

/**
 * POST /webhook/interac
 * Interac authorization webhook
 */
router.post("/interac", async (req, res) => {
  try {
    const { interacRequestId, status } = req.body;

    if (!interacRequestId || !status) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    /**
     * Fetch transfer
     */
    const { data: transfers, error } = await supabase
      .from("transfers")
      .select("*")
      .eq("interac_request_id", interacRequestId)
      .limit(1);

    if (error || !transfers.length) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    const transfer = transfers[0];
    const normalizedStatus = status.toUpperCase();

    /**
     * OPTION A — Idempotency
     * If already processed beyond PENDING, acknowledge and exit
     */
    if (transfer.status !== TRANSFER_STATES.PENDING) {
      return res.json({ ok: true });
    }

    if (normalizedStatus !== "AUTHORIZED") {
      return res.status(400).json({ error: "Unsupported Interac status" });
    }

    /**
     * PENDING → AUTHORIZED
     */
    assertValidTransition(transfer.status, TRANSFER_STATES.AUTHORIZED);
    await updateTransferStatus({
      id: transfer.id,
      status: TRANSFER_STATES.AUTHORIZED,
    });

    /**
     * AUTHORIZED → CONVERTING
     */
    await updateTransferStatus({
      id: transfer.id,
      status: TRANSFER_STATES.CONVERTING,
    });

    /**
     * ---------------------------------------
     * USER-FACING FX (receiver payout)
     * ---------------------------------------
     * Receiver gets value of principal only
     */
    const cadToUsdRate = await getCadToUsdRate();

    const userPayoutUsd = Number(
      (transfer.amount_cad * cadToUsdRate).toFixed(2)
    );

    /**
     * ---------------------------------------
     * SETTLEMENT (backend / treasury)
     * ---------------------------------------
     */
    const settlement = await convertCadToStablecoin({
      transferId: transfer.id,
      amountCad: transfer.amount_cad,
    });

    const settlementUsd = Number(
      settlement.usdtAmount.toFixed(6) // USDT ≈ USD
    );

    /**
     * ---------------------------------------
     * PLATFORM ECONOMICS (persisted facts)
     * ---------------------------------------
     */
    const cadToUsdtRate = Number(
      (settlement.usdtAmount / transfer.amount_cad).toFixed(6)
    );
    const fxMarginUsdt = Number(
      (settlement.usdtAmount - userPayoutUsd).toFixed(6)
    );
    const fxMarginUsd = Number((settlementUsd - userPayoutUsd).toFixed(2));

    /**
     * Persist finalized economics
     * (this is the ONLY correct moment to do this)
     */
    await updateTransferEconomics({
      id: transfer.id,
      usdtAmount: settlement.usdtAmount,
      usdAmount: userPayoutUsd,
      platformFeeCad: TRANSACTION_FEE_CAD,
      cadToUsdtRate,
      cadToUsdRate,
      fxMarginUsdt,
    });

    console.log("TRANSFER ECONOMICS", {
      transferId: transfer.id,
      principalCad: transfer.amount_cad,
      userPayoutUsd,
      settlementUsd,
      fxMarginUsd,
      platformFeeCad: TRANSACTION_FEE_CAD,
      fxMarginUsdt,
    });

    /**
     * ---------------------------------------
     * CREDIT RECEIVER (USD)
     * ---------------------------------------
     */
    await creditWallet({
      userId: transfer.receiver_id,
      currency: "USD",
      amount: userPayoutUsd,
    });

    /**
     * ---------------------------------------
     * COLLECT PLATFORM FEE (CAD)
     * Sender paid principal + fee upstream
     * ---------------------------------------
     */
    await creditMasterWallet({
      masterType: "PLATFORM_FEE",
      currency: "CAD",
      amount: TRANSACTION_FEE_CAD,
    });
    if (fxMarginUsd > 0) {
      await creditMasterWallet({
        masterType: "PLATFORM_PROFIT",
        currency: "USDT",
        amount: fxMarginUsdt,
      });
    }
    /**
     * CONVERTING → COMPLETED
     */
    await updateTransferStatus({
      id: transfer.id,
      status: TRANSFER_STATES.COMPLETED,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("INTERAC WEBHOOK ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
