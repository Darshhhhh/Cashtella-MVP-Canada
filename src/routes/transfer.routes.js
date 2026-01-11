const express = require("express");
const router = express.Router();
const {
  createTransfer,
  getTransferById,
  updateTransferStatus,
} = require("../repositories/transfer.repository");
const { createInteracRequest } = require("../services/interac.service");

const { TRANSFER_STATES } = require("../domain/transferStateMachine");
// Create a new transfer intent
router.post("/initiate", async (req, res) => {
  try {
    const { senderId, receiverId, amountCad } = req.body;

    if (!senderId || !receiverId || !amountCad) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const transferId = crypto.randomUUID();

    await createTransfer({
      id: transferId,
      senderId,
      receiverId,
      amountCad,
      status: TRANSFER_STATES.PENDING,
    });

    const interac = await createInteracRequest({
      transferId,
      amountCad,
    });

    await updateTransferStatus({
      id: transferId,
      status: TRANSFER_STATES.PENDING,
      interacRequestId: interac.interacRequestId,
    });

    return res.status(201).json({
      transferId,
      status: TRANSFER_STATES.PENDING,
    });
  } catch (err) {
    // console.error(err);
    console.error("INITIATE TRANSFER ERROR:", err.message, err);
    return res.status(500).json({ error: "Failed to initiate transfer" });
  }
});
// Fetch transfer status by ID
router.get("/:id", async (req, res) => {
  try {
    const transfer = await getTransferById(req.params.id);
    return res.json(transfer);
  } catch (err) {
    return res.status(404).json({ error: "Transfer not found" });
  }
});

module.exports = router;
