const { supabase } = require("./supabase");

/**
 * Ensure a user exists.
 * If not, create a shell user.
 */
async function ensureUserExists(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  // User already exists
  if (data) return;

  // If error is NOT "row not found", fail hard
  if (error && error.code !== "PGRST116") {
    throw new Error("Failed to check user existence");
  }

  // Create shell user
  const { error: insertError } = await supabase.from("users").insert([
    {
      id: userId,
      role: "USER",
      status: "PENDING",
      created_from: "TRANSFER",
    },
  ]);

  if (insertError) {
    throw new Error("Failed to create shell user");
  }
}

module.exports = {
  ensureUserExists,
};
