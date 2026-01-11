const express = require("express");
const {
  getTransferById,
  updateTransferStatus,
} = require("../repositories/transfer.repository");
const {
  assertValidTransition,
  TRANSFER_STATES,
} = require("../domain/transferStateMachine");

const router = express.Router();
// Interac webhook to handle status updates
router.post("/interac", async (req, res) => {
  try {
    const { interacRequestId, status } = req.body;

    if (!interacRequestId || !status) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    // Find transfer by interac_request_id
    const { data: transfers, error } = await require("../services/supabase")
      .supabase.from("transfers")
      .select("*")
      .eq("interac_request_id", interacRequestId)
      .limit(1);

    if (error || !transfers.length) {
      return res.status(404).json({ error: "Transfer not found" });
    }

    const transfer = transfers[0];

    if (status === "AUTHORIZED") {
      assertValidTransition(transfer.status, TRANSFER_STATES.AUTHORIZED);
      console.log("UPDATING TRANSFER TO AUTHORIZED:", transfer.id);
      await updateTransferStatus({
        id: transfer.id,
        status: TRANSFER_STATES.AUTHORIZED,
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("INTERAC WEBHOOK ERROR:", err.message);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
