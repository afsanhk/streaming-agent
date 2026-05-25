import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useAgentStream
 * ────────────── *
 * It should manage the full SSE lifecycle:
 *   - Opening an EventSource connection to /api/stream
 *   - Appending tokens as they arrive
 *   - Handling the "done" event
 *   - Handling the "error" event
 *   - Exposing a way to reconnect
 *   - Cleaning up the EventSource on unmount
 *
 * Return shape (don't change this — AgentOutputPanel depends on it):
 * {
 *   tokens:      string      — accumulated output so far
 *   status:      "idle" | "connecting" | "streaming" | "done" | "error"
 *   errorMsg:    string | null
 *   start:       () => void  — opens the connection (or reconnects)
 *   reset:       () => void  — clears output and returns to idle
 * }
 *
 * HINTS:
 *   - Use a ref for the EventSource instance so closing it doesn't trigger re-renders ✅
 *   - Listen for "token", "done", and "error" event types (not the generic "message" event) ✅
 *   - The server sends JSON in each event's data field — remember to JSON.parse it ✅
 *   - Close and null the EventSource ref in your cleanup / on error / on done ✅
 *   - useCallback on `start` and `reset` so consumers don't re-render unnecessarily ✅
 *
 * STRETCH:
 *   - Accept a `scenario` param and append ?scenario=error to the URL ✅
 *   - Batch token appends with requestAnimationFrame instead of setting state on every token
 */

let STREAM_URL = "/api/stream";

export function useAgentStream() {
  const [tokens, setTokens] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);

  const sourceRef = useRef(null);

  // For requestAnimationFrame implementation
  const tokenBufferRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    return () => {
      sourceRef.current?.close()
      sourceRef.current = null

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      tokenBufferRef.current = [];
    }
  }, [])
  const start = useCallback((scenario) => {
    const url = scenario ? `${STREAM_URL}?scenario=${scenario}` : STREAM_URL;
    // close any existing connection first
    if (sourceRef && sourceRef.current) {
      sourceRef.current.close()
      sourceRef.current = null
    }
    // set status to "connecting"
    setStatus("connecting")
    // create a new EventSource(STREAM_URL)
    const evtSource = new EventSource(url);
    sourceRef.current = evtSource

    // listen for "token" events → append to tokens, set status "streaming"
    evtSource.addEventListener("token", function(event) {
      setStatus("streaming")
      const data = JSON.parse(event.data);
      tokenBufferRef.current.push(data.token);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const batch = tokenBufferRef.current.splice(0); // drain without clearing ref
        setTokens(prev => prev + batch.join(""));
        rafRef.current = null;
      });
    });
    // listen for "done" events → close source, set status "done"
    evtSource.addEventListener('done', function() {
      sourceRef.current?.close()
      sourceRef.current = null
      setStatus("done")
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      tokenBufferRef.current = [];
    });
    // listen for "error" events → close source, set errorMsg, set status "error"
    evtSource.addEventListener("error", function(event) {
      if (!event.data) return; // browser connection close, let onerror handle it
      const data = JSON.parse(event.data);
      setStatus("error")
      setErrorMsg(data.message)
      sourceRef.current?.close()
      sourceRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      tokenBufferRef.current = [];
    });
    // handle the built-in onerror (connection drop) separately from the custom "error" event
    evtSource.onerror = function() {
      setStatus("error")
      setErrorMsg("Connection lost")  // no event.data here
      sourceRef.current?.close()
      sourceRef.current = null
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      tokenBufferRef.current = [];
    };
  }, []);

  const reset = useCallback(() => {
    // close any open connection, clear tokens, reset status to "idle"
    sourceRef?.current?.close()
    sourceRef.current = null

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    tokenBufferRef.current = [];

    setTokens("")
    setStatus("idle")
    setErrorMsg("")
  }, []);

  return { tokens, status, errorMsg, start, reset };
}
