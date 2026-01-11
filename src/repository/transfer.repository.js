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

module.exports = {
  createTransfer,
  getTransferById,
};
