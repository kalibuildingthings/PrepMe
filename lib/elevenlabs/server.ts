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
 * Runs a short, text-only simulated conversation against the interviewer
 * agent to have its LLM produce the 10 likely interview questions and the
 * resume/JD gap analysis shown on the dashboard before the live voice
 * session starts. This reuses the same agent (and therefore the same
 * ElevenLabs API key) rather than introducing a second AI vendor.
 */
export async function simulateAgentText(userMessage: string): Promise<string> {
  const agentId = requireEnv("ELEVENLABS_AGENT_ID");
  const res = await fetch(`${BASE_URL}/v1/convai/agents/${agentId}/simulate-conversation`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      simulation_specification: {
        simulated_user_config: {
          first_message: userMessage,
        },
      },
      new_turns_limit: 1,
    }),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs simulate-conversation failed (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  const turns = data.simulated_conversation ?? [];
  const agentTurn = turns.find((t: { role: string }) => t.role === "agent");
  return agentTurn?.message ?? "";
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
