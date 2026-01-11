require("dotenv").config();
const express = require("express");
const routes = require("./routes");
const app = express();

// middleware
app.use(express.json());

// health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use("/api", routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
