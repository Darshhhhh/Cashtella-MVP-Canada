const express = require("express");
const { supabase } = require("../services/supabase");

const { updateTransferStatus } = require("../repositories/transfer.repository");
const {
  assertValidTransition,
  TRANSFER_STATES,
} = require("../domain/transferStateMachine");

const { convertCadToStablecoin } = require("../services/bridge.service");
const { getCadToUsdRate } = require("../services/fx.service");
const { creditWallet } = require("../services/ledger.service");

const router = express.Router();

/**
 * POST /webhook/interac
 */
router.post("/interac", async (req, res) => {
  try {
    const { interacRequestId, status } = req.body;

    if (!interacRequestId || !status) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    // fetch transfer
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

    // OPTION A: idempotent handling
    if (transfer.status !== TRANSFER_STATES.PENDING) {
      return res.json({ ok: true });
    }

    if (normalizedStatus !== "AUTHORIZED") {
      return res.status(400).json({ error: "Unsupported Interac status" });
    }

    // PENDING → AUTHORIZED
    assertValidTransition(transfer.status, TRANSFER_STATES.AUTHORIZED);
    await updateTransferStatus({
      id: transfer.id,
      status: TRANSFER_STATES.AUTHORIZED,
    });

    // AUTHORIZED → CONVERTING
    await updateTransferStatus({
      id: transfer.id,
      status: TRANSFER_STATES.CONVERTING,
    });

    /**
     * -----------------------------
     * USER-FACING FX (receiver)
     * -----------------------------
     */
    const userFxRate = await getCadToUsdRate();
    const userPayoutUsd = Number((transfer.amount_cad * userFxRate).toFixed(2));

    /**
     * -----------------------------
     * SETTLEMENT (company)
     * -----------------------------
     */
    const settlement = await convertCadToStablecoin({
      transferId: transfer.id,
      amountCad: transfer.amount_cad,
    });

    const settlementUsd = Number(
      settlement.usdtAmount.toFixed(2) // USDT ≈ USD
    );

    /**
     * -----------------------------
     * COMPANY FX MARGIN (internal)
     * -----------------------------
     */
    const fxMarginUsd = Number((settlementUsd - userPayoutUsd).toFixed(2));

    console.log("TRANSFER ECONOMICS", {
      transferId: transfer.id,
      userPayoutUsd,
      settlementUsd,
      fxMarginUsd,
      feeCad: 1.99,
    });

    /**
     * -----------------------------
     * CREDIT RECEIVER (FULL AMOUNT)
     * -----------------------------
     */
    await creditWallet({
      userId: transfer.receiver_id,
      currency: "USD",
      amount: userPayoutUsd,
    });

    // CONVERTING → COMPLETED
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
