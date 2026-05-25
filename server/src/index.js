import Fastify from "fastify";
import cors from "@fastify/cors";
import streamRoutes from "./routes/stream.js";

const fastify = Fastify({ logger: true });

// ── Plugins ───────────────────────────────────────────────────────────────────
await fastify.register(cors, {
  origin: "http://localhost:5173", // Vite dev server default
  methods: ["GET"],
});

// ── Routes ────────────────────────────────────────────────────────────────────
await fastify.register(streamRoutes, { prefix: "/api" });

// ── Start ─────────────────────────────────────────────────────────────────────
try {
  await fastify.listen({ port: 3001, host: "0.0.0.0" });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
