import { useAgentStream } from "../hooks/useAgentStream.js";
import "./AgentOutputPanel.css";

/**
 * AgentOutputPanel
 * ─────────────────
 * YOUR TASK: wire this component to useAgentStream and build the UI.
 *
 * Required behaviour:
 *   1. A "Run Agent" button that calls start() — disabled while streaming
 *   2. A skeleton/loading state shown while status === "connecting"
 *   3. Token output rendered incrementally as they arrive
 *   4. A blinking cursor shown while status === "streaming"
 *   5. A status badge: Idle / Connecting / Streaming / Done / Error
 *   6. An error message displayed when status === "error"
 *   7. A "Reconnect" button shown when status === "error"
 *   8. A "Reset" button shown when status === "done" or "error"
 *
 * HINTS:
 *   - Use a <pre> or a <div> with white-space: pre-wrap for the token output
 *   - The blinking cursor can be a <span className="cursor"> styled in CSS
 *   - Disable the "Run Agent" button when status is "connecting" or "streaming"
 *   - "Reconnect" should call start() directly (same as Run Agent)
 *
 * STRETCH:
 *   - Add a scenario selector dropdown (?scenario=error) and pass it to the hook
 *   - Auto-scroll the output panel to the bottom as tokens arrive
 *     (useEffect watching tokens + scrollIntoView on a bottom anchor ref)
 */

export default function AgentOutputPanel() {
  const { tokens, status, errorMsg, start, reset } = useAgentStream();

  return (
    <div className="agent-panel">
      <div className="agent-panel-header">
        <h1>Agent Output</h1>
        {/* TODO: status badge */}
      </div>

      <div className="agent-panel-output">
        {/* TODO: connecting skeleton */}

        {/* TODO: token output + blinking cursor */}

        {/* TODO: error message */}
      </div>

      <div className="agent-panel-actions">
        {/* TODO: Run Agent button */}
        <button onClick={() => start()}>Run Agent</button>
        {/* TODO: Reconnect button (only on error) */}
        <button onClick={() => start()}>Reconnect</button>
        {/* TODO: Reset button (on done or error) */}
        <button onClick={() => reset()}>Reset Agent</button>

      </div>
    </div>
  );
}
