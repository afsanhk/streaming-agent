# Streaming Agent Output Panel

## Goal
Build a frontend UI that connects to the SSE endpoint below and renders an AI
agent "thinking out loud" — token by token, like ChatGPT.

## Getting started

```bash
cd server
npm install
npm run dev     # starts on http://localhost:3001
```

Then create your own frontend (Vite + React recommended):
```bash
cd ..
npm create vite@latest client -- --template react
```

---

## Endpoint

| Method | URL                        | Description                     |
|--------|----------------------------|---------------------------------|
| GET    | `/api/stream`              | Default scenario                |
| GET    | `/api/stream?scenario=error` | Simulates a mid-stream failure |

### SSE Event Types

| Event   | Payload                          | When                         |
|---------|----------------------------------|------------------------------|
| `token` | `{ token: string }`              | Each word as it arrives      |
| `error` | `{ message: string }`            | Simulated agent failure      |
| `done`  | `{ totalTokens: number }`        | Stream complete              |

### Example (browser)
```js
const source = new EventSource("http://localhost:3001/api/stream");

source.addEventListener("token", (e) => {
  const { token } = JSON.parse(e.data);
  // TODO: append token to your UI
});

source.addEventListener("done", () => {
  source.close();
  // TODO: update UI state to "complete"
});

source.addEventListener("error", (e) => {
  // TODO: display error message, show reconnect button
  source.close();
});
```

---

## Your tasks
1. Connect to the SSE stream using `EventSource`
2. Show a `thinking...` skeleton before the first token arrives
3. Append each token to the output as it arrives (do not replace)
4. Handle the `error` event — display it gracefully in the UI
5. Handle the `done` event — mark the output as complete
6. Add a **Reconnect** button that re-opens the `EventSource`

## Stretch goals
- Add a `?scenario=` query param so the user can select different responses
- Batch token updates with `requestAnimationFrame` to avoid a re-render per token
- Move the `EventSource` logic into a reusable `useAgentStream(url)` hook
- Simulate the backend going down mid-stream by setting `SIMULATE_FAILURE = true` in `server/src/routes/stream.js`
