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
async function updateTransferEconomics({
  id,
  usdtAmount,
  usdAmount,
  platformFeeCad,
  cadToUsdtRate,
  cadToUsdRate,
  fxMarginUsdt,
}) {
  const { error } = await supabase
    .from("transfers")
    .update({
      usdt_amount: usdtAmount,
      usd_amount: usdAmount,
      platform_fee_cad: platformFeeCad,
      cad_to_usdt_rate: cadToUsdtRate,
      cad_to_usd_rate: cadToUsdRate,
      fx_margin_usdt: fxMarginUsdt,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update transfer economics: ${error.message}`);
  }
}

module.exports = {
  createTransfer,
  getTransferById,
  updateTransferStatus,
  updateTransferEconomics,
};
