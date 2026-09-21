import WebSocket from "ws";

const BASE_URL = "https://api.elevenlabs.io";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env.local and fill in your ElevenLabs credentials (see README.md).`
    );
  }
  return value;
}

function headers() {
  return {
    "xi-api-key": requireEnv("ELEVENLABS_API_KEY"),
    "Content-Type": "application/json",
  };
}

/**
 * A signed URL lets the browser open a private WebSocket session with the
 * Conversational AI agent without ever exposing the ElevenLabs API key.
 */
export async function getSignedUrl(): Promise<string> {
  const agentId = requireEnv("ELEVENLABS_AGENT_ID");
  const res = await fetch(
    `${BASE_URL}/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`ElevenLabs signed-url request failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.signed_url as string;
}

/**
 * Gets one real text reply out of the interviewer agent — used to have its
 * LLM produce the 10 likely interview questions and the resume/JD gap
 * analysis shown on the dashboard before the live voice session starts.
 *
 * This opens the same real-time conversation WebSocket the browser uses for
 * the live interview (via a signed URL), but sends a text `user_message`
 * event instead of audio, so no TTS/STT round-trip happens. This reuses the
 * same agent (and therefore the same ElevenLabs API key) rather than
 * introducing a second AI vendor.
 *
 * The agent auto-plays its own greeting as soon as the session opens,
 * before it's heard anything from us — so the first `agent_response` is
 * always that greeting, and our text only gets a real answer once we send
 * it after that greeting arrives (or after a short timeout, in case the
 * agent has no configured greeting at all).
 */
export async function getAgentTextReply(userMessage: string): Promise<string> {
  const signedUrl = await getSignedUrl();

  return new Promise<string>((resolve, reject) => {
    const ws = new WebSocket(signedUrl);
    let sentUserMessage = false;
    let greetingTimer: ReturnType<typeof setTimeout> | null = null;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for a reply from the interviewer agent."));
    }, 45_000);

    function cleanup() {
      clearTimeout(timeout);
      if (greetingTimer) clearTimeout(greetingTimer);
      ws.close();
    }

    function sendUserMessage() {
      if (sentUserMessage) return;
      sentUserMessage = true;
      if (greetingTimer) clearTimeout(greetingTimer);
      ws.send(JSON.stringify({ type: "user_message", text: userMessage }));
    }

    ws.on("open", () => {
      // In case the agent has no greeting configured and never sends an
      // initial agent_response, don't wait forever to send our message.
      greetingTimer = setTimeout(sendUserMessage, 4_000);
    });

    ws.on("message", (raw) => {
      let event: { type?: string; agent_response_event?: { agent_response?: string } };
      try {
        event = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (event.type === "ping") {
        ws.send(JSON.stringify({ type: "pong" }));
        return;
      }

      if (event.type === "agent_response") {
        if (!sentUserMessage) {
          // This is the agent's own opening greeting — ignore it and now
          // ask our real question.
          sendUserMessage();
          return;
        }
        const text = event.agent_response_event?.agent_response ?? "";
        cleanup();
        resolve(text);
      }
    });

    ws.on("error", (err) => {
      cleanup();
      reject(err instanceof Error ? err : new Error(String(err)));
    });

    ws.on("close", () => {
      clearTimeout(timeout);
    });
  });
}

export interface ConversationAnalysis {
  transcriptSummary?: string;
  dataCollectionResults?: Record<string, { value?: string | number; rationale?: string }>;
  evaluationCriteriaResults?: Record<string, { result?: string; rationale?: string }>;
}

/**
 * Fetches the finished conversation, including whatever the agent's
 * configured evaluation criteria / data collection extracted (per-question
 * scores, strengths, weaknesses). See README.md for the exact fields this
 * app expects to be configured on the agent.
 */
export async function getConversationAnalysis(conversationId: string): Promise<ConversationAnalysis> {
  const res = await fetch(`${BASE_URL}/v1/convai/conversations/${conversationId}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs get-conversation failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return {
    transcriptSummary: data.analysis?.transcript_summary,
    dataCollectionResults: data.analysis?.data_collection_results,
    evaluationCriteriaResults: data.analysis?.evaluation_criteria_results,
  };
}
