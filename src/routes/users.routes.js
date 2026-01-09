const prisma = require("../utils/db");

async function userRoutes(fastify) {
  fastify.post("/users", async (req, reply) => {
    const { country } = req.body;
    if (!["CA", "US"].includes(country)) {
      return reply.status(400).send({ error: "Invalid country" });
    }

    const user = await prisma.user.create({
      data: { country },
    });

    return user;
  });

  fastify.get("/users/:id", async (req, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!user) return reply.status(404).send({ error: "Not found" });
    return user;
  });
}

module.exports = userRoutes;
