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
 *   - Accept a `scenario` param and append ?scenario=error to the URL
 *   - Batch token appends with requestAnimationFrame instead of setting state on every token
 */

const STREAM_URL = "/api/stream";

export function useAgentStream() {
  const [tokens, setTokens] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);

  const sourceRef = useRef(null);
  useEffect(() => {
    return () => {
      sourceRef.current?.close()
      sourceRef.current = null
    }
  }, [])
  const start = useCallback(() => {
    // TODO: close any existing connection first
    if (sourceRef && sourceRef.current) {
      sourceRef.current.close()
      sourceRef.current = null
    }
    // TODO: set status to "connecting"
    setStatus("connecting")
    // TODO: create a new EventSource(STREAM_URL)
    const evtSource = new EventSource(STREAM_URL);
    sourceRef.current = evtSource
    // TODO: listen for "token" events → append to tokens, set status "streaming"
    evtSource.addEventListener('token', function(event) {
      const data = JSON.parse(event.data);
      console.log("Update received: ", data);
      setTokens(prev => prev + data.token)
      setStatus("streaming")
    });
    // TODO: listen for "done" events → close source, set status "done"
    evtSource.addEventListener('done', function() {
      sourceRef.current?.close()
      sourceRef.current = null
      console.log("Done!");
      setStatus("done")
    });
    // TODO: listen for "error" events → close source, set errorMsg, set status "error"
    evtSource.addEventListener("error", function(event) {
      const data = JSON.parse(event.data)
      setStatus("error")
      setErrorMsg(data.message)
      sourceRef.current?.close()
      sourceRef.current = null
    });
    // TODO: handle the built-in onerror (connection drop) separately from the custom "error" event
    evtSource.onerror = function() {
      setStatus("error")
      setErrorMsg("Connection lost")  // no event.data here
      sourceRef.current?.close()
      sourceRef.current = null
    };
  }, []);

  const reset = useCallback(() => {
    // TODO: close any open connection, clear tokens, reset status to "idle"
    sourceRef?.current?.close()
    sourceRef.current = null

    setTokens("")
    setStatus("idle")
    setErrorMsg("")
  }, []);

  return { tokens, status, errorMsg, start, reset };
}
