const express = require("express");

const transferRoutes = require("./transfer.routes");
const webhookRoutes = require("./webhook.routes");

const router = express.Router();

router.use("/transfer", transferRoutes);
router.use("/webhook", webhookRoutes);

module.exports = router;
