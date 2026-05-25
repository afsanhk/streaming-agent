/**
 * GET /api/stream
 *
 * Server-Sent Events endpoint that simulates an AI agent "thinking out loud".
 * Sends tokens one at a time with a configurable delay, then closes the stream.
 *
 * YOUR TASKS:
 *  1. Connect to this from the frontend using the EventSource API.
 *  2. Render each incoming token incrementally (append, don't replace).
 *  3. Show a skeleton/loading state before the first token arrives.
 *  4. Handle the "error" event type — display it in the UI gracefully.
 *  5. Handle the "done" event type — mark the stream as complete.
 *  6. Add a reconnect button that re-opens the EventSource connection.
 *
 * STRETCH:
 *  - Add a ?scenario=query-param so the frontend can request different fake responses.
 *  - Simulate a mid-stream failure (see SIMULATE_FAILURE flag below).
 */

// ── Fake agent responses ──────────────────────────────────────────────────────
const SCENARIOS = {
  default: "Analysing the workflow... I can see three nodes connected in sequence. "
    + "The first calls the language model, the second invokes a tool to query the "
    + "knowledge base, and the third formats the output for the user. "
    + "I recommend adding a human review gate between steps two and three.",

  error: null, // triggers a simulated mid-stream error
};

// Set to true to simulate a mid-stream failure (useful for frontend error handling practice)
const SIMULATE_FAILURE = false;

const TOKEN_DELAY_MS = 80;  // milliseconds between each token

// ── Route ─────────────────────────────────────────────────────────────────────
export default async function streamRoutes(fastify) {
  fastify.get("/stream", async (request, reply) => {
    const scenario = request.query.scenario ?? "default";
    const text = SCENARIOS[scenario];

    // SSE headers — Fastify will not send them automatically
    reply.raw.writeHead(200, {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering if behind a proxy
    });

    // Helper: write a single SSE frame
    const send = (type, data) => {
      reply.raw.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // ── Simulate mid-stream error ──────────────────────────────────────────
    if (scenario === "error" || SIMULATE_FAILURE) {
      send("token", { token: "Analysing" });
      await delay(400);
      send("token", { token: " your" });
      await delay(400);
      // TODO: handle this "error" event type on the frontend
      send("error", { message: "Agent lost context — please retry." });
      reply.raw.end();
      return;
    }

    // ── Normal token-by-token stream ──────────────────────────────────────
    const tokens = text.split(" ");

    for (let i = 0; i < tokens.length; i++) {
      // Append a space before each token except the first
      const token = i === 0 ? tokens[i] : " " + tokens[i];
      send("token", { token });
      await delay(TOKEN_DELAY_MS);
    }

    // Signal the frontend that the stream has finished
    // TODO: listen for this event and update your UI accordingly
    send("done", { totalTokens: tokens.length });
    reply.raw.end();
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
