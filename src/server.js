require("dotenv").config();
const Fastify = require("fastify");

const userRoutes = require("./routes/users.routes");
const treasuryRoutes = require("./routes/treasury.routes");

const app = Fastify({
  logger: true,
});

// Health check
app.get("/health", async () => {
  return { status: "ok" };
});

// Routes
app.register(userRoutes);
app.register(treasuryRoutes);

// Global error handler (important for debugging APIs)
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  reply.status(500).send({
    error: error.message,
  });
});

const start = async () => {
  try {
    await app.listen({ port: process.env.PORT || 3000 });
    app.log.info(`Server running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
