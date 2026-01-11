const express = require("express");
const router = express.Router();


// Interac authorization callback

router.post("/interac", (req, res) => {
  return res.status(501).json({
    message: "Not implemented yet",
  });
});

module.exports = router;
