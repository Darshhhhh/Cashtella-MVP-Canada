const { supabase } = require("../services/supabase");

async function createTransfer({ id, senderId, receiverId, amountCad, status }) {
  const { error } = await supabase.from("transfers").insert([
    {
      id,
      sender_id: senderId,
      receiver_id: receiverId,
      amount_cad: amountCad,
      status,
    },
  ]);

  if (error) {
    throw new Error(`Failed to create transfer: ${error.message}`);
  }
}

async function getTransferById(id) {
  const { data, error } = await supabase
    .from("transfers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Transfer not found: ${error.message}`);
  }

  return data;
}

async function updateTransferStatus({ id, status, interacRequestId }) {
  const update = { status };

  if (interacRequestId) {
    update.interac_request_id = interacRequestId;
  }

  const { error } = await supabase
    .from("transfers")
    .update(update)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update transfer: ${error.message}`);
  }
}

module.exports = {
  createTransfer,
  getTransferById,
  updateTransferStatus,
};
