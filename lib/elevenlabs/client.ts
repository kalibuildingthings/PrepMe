"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback, useState } from "react";

export interface StartInterviewParams {
  signedUrl: string;
  jdText: string;
  resumeText: string;
  gaps: string[];
  prepMethod: string;
  questions: { id: string; text: string }[];
}

/**
 * Thin wrapper around @elevenlabs/react's useConversation, scoped to how
 * PrepMe drives the interviewer agent: it passes everything the agent needs
 * (JD, resume, gaps, prep framework, the 10 questions) in as dynamic
 * variables so the agent's system prompt (configured in the ElevenLabs
 * dashboard) can reference them, e.g. {{jd_text}}, {{prep_method}}.
 */
export function useInterviewConversation(onEnd: (conversationId: string | null) => void) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversation = useConversation({
    onConnect: () => {},
    onDisconnect: () => onEnd(conversationId),
    onError: (message: unknown) => console.error("ElevenLabs conversation error:", message),
  });

  const start = useCallback(
    async (params: StartInterviewParams) => {
      const id = await conversation.startSession({
        signedUrl: params.signedUrl,
        dynamicVariables: {
          jd_text: params.jdText.slice(0, 6000),
          resume_text: params.resumeText.slice(0, 6000),
          gaps: params.gaps.join("; "),
          prep_method: params.prepMethod,
          questions_json: JSON.stringify(params.questions),
        },
      });
      setConversationId(typeof id === "string" ? id : null);
      return id;
    },
    [conversation]
  );

  const stop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return {
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    start,
    stop,
    conversationId,
  };
}
