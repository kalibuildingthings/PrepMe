"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrepMeStore } from "@/lib/store";
import { useInterviewConversation } from "@/lib/elevenlabs/client";
import { VoiceOrb } from "@/components/VoiceOrb";
import { remainingMinutesToday } from "@/lib/usage";

export default function SessionPage() {
  const router = useRouter();
  const store = usePrepMeStore();
  const { jdText, resumeText, gaps, prepMethod, questions, tier, usage, logMinutesUsed, addResult } = store;

  const [phase, setPhase] = useState<"idle" | "connecting" | "live" | "wrapping" | "error">("idle");
  const [error, setError] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remainingMinutes = remainingMinutesToday(usage, tier);
  const remainingSec = isFinite(remainingMinutes) ? remainingMinutes * 60 : Infinity;

  const handleEnd = useCallback(
    async (conversationId: string | null) => {
      setPhase("wrapping");
      if (timerRef.current) clearInterval(timerRef.current);
      const minutesUsed = startedRef.current ? (Date.now() - startedRef.current) / 60000 : elapsedSec / 60;
      logMinutesUsed(minutesUsed);

      if (!conversationId) {
        router.push("/dashboard");
        return;
      }

      try {
        const res = await fetch("/api/session/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, questions }),
        });
        const data = await res.json();
        if (res.ok) {
          addResult(data);
          router.push("/results");
        } else {
          setError(data.error ?? "Couldn't score this session.");
          setPhase("error");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't score this session.");
        setPhase("error");
      }
    },
    [addResult, elapsedSec, logMinutesUsed, questions, router]
  );

  const conversation = useInterviewConversation(handleEnd);

  async function start() {
    setError("");
    setPhase("connecting");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const res = await fetch("/api/elevenlabs/signed-url");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await conversation.start({
        signedUrl: data.signedUrl,
        jdText,
        resumeText,
        gaps,
        prepMethod: prepMethod ?? "STAR",
        questions: questions.map((q) => ({ id: q.id, text: q.text })),
      });

      startedRef.current = Date.now();
      setPhase("live");
      timerRef.current = setInterval(() => {
        setElapsedSec((s) => {
          const next = s + 1;
          if (next >= remainingSec) {
            conversation.stop();
          }
          return next;
        });
      }, 1000);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Couldn't start the session. Check microphone permissions and try again."
      );
      setPhase("error");
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const mmss = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-10">
      <button onClick={() => router.push("/dashboard")} className="self-start text-sm text-slate-400">
        ← Back
      </button>

      <div className="flex flex-col items-center">
        <VoiceOrb active={phase === "live"} speaking={conversation.isSpeaking} />
        <p className="mt-8 text-lg font-semibold text-ink">
          {phase === "idle" && "Ready when you are"}
          {phase === "connecting" && "Connecting to your interviewer..."}
          {phase === "live" && (conversation.isSpeaking ? "Interviewer speaking..." : "Listening...")}
          {phase === "wrapping" && "Scoring your answers..."}
          {phase === "error" && "Something went wrong"}
        </p>
        {phase === "live" && <p className="mt-1 text-sm text-slate-400">{mmss} elapsed</p>}
        {error && <p className="mt-3 max-w-xs text-center text-sm text-red-500">{error}</p>}
      </div>

      <div className="w-full">
        {phase === "idle" || phase === "error" ? (
          <button onClick={start} className="btn-primary w-full">
            {phase === "error" ? "Try again" : "Begin discussion"}
          </button>
        ) : phase === "live" ? (
          <button onClick={() => conversation.stop()} className="btn-secondary w-full">
            End session
          </button>
        ) : (
          <div className="btn-primary w-full opacity-60">Please wait...</div>
        )}
      </div>
    </main>
  );
}
