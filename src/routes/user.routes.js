const express = require("express");
const { supabase } = require("../services/supabase");

const router = express.Router();

/**
 * POST /users
 * Create a user identity
 */
router.post("/", async (req, res) => {
  try {
    const { id, country, role = "USER" } = req.body;

    if (!id || !country) {
      return res.status(400).json({
        error: "User id and country are required",
      });
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create user
    const { error: insertError } = await supabase.from("users").insert([
      {
        id,
        role,
        country,
        status: "PENDING",
      },
    ]);

    if (insertError) {
      throw insertError;
    }

    return res.status(201).json({
      id,
      role,
      status: "PENDING",
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
