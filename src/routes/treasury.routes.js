const { getTreasuryWallet } = require("../services/blockradar.service");

async function treasuryRoutes(fastify, options) {
  fastify.get("/treasury/onchain", async () => {
    return {
      address: process.env.TREASURY_WALLET_ADDRESS,
      note: "On-chain balance tracking via BlockRadar (stubbed for MVP)",
    };
  });
}

module.exports = treasuryRoutes;
