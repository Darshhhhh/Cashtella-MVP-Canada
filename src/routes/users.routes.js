const prisma = require("../utils/db");
const { createWallet } = require("../services/blockradar.service");

async function userRoutes(fastify, options) {
  fastify.post("/users", async (request, reply) => {
    const { country } = request.body;

    if (!country || !["CA", "US"].includes(country)) {
      return reply.status(400).send({ error: "Invalid country" });
    }

    const wallet = await createWallet();

    const user = await prisma.user.create({
      data: {
        country,
        blockradarWalletId: wallet.id,
      },
    });

    return {
      id: user.id,
      country: user.country,
      walletId: user.blockradarWalletId,
    };
  });
}

module.exports = userRoutes;
