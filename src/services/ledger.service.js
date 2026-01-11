const { supabase } = require("./supabase");

/**
 * Credit a custodial wallet
 * Strongly consistent
 */
async function creditWallet({ userId, currency, amount }) {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .eq("currency", currency)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error("Failed to read wallet");
  }

  // wallet does not exist → create
  if (!data) {
    const { error: insertError } = await supabase.from("wallets").insert([
      {
        user_id: userId,
        currency,
        balance: amount,
      },
    ]);

    if (insertError) {
      throw new Error("Failed to create wallet");
    }

    return;
  }

  // wallet exists → update balance
  const { error: updateError } = await supabase
    .from("wallets")
    .update({
      balance: Number(data.balance) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  if (updateError) {
    throw new Error("Failed to update wallet");
  }
}

module.exports = {
  creditWallet,
};
