const express = require("express");
const router = express.Router();

// Create a new transfer intent 
router.post("/initiate", (req, res) => {
  return res.status(501).json({
    message: "Not implemented yet",
  });
});

// Fetch transfer status by ID
router.get("/:id", (req, res) => {
  return res.status(501).json({
    message: "Not implemented yet",
  });
});

module.exports = router;
