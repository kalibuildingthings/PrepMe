import { NextRequest, NextResponse } from "next/server";
import { getConversationAnalysis } from "@/lib/elevenlabs/server";
import { InterviewQuestion, QuestionScore, SessionResult } from "@/lib/types";

export const runtime = "nodejs";

function splitList(value?: string | number): string[] {
  if (value == null) return [];
  return String(value)
    .split(/\n|;|(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? Math.max(0, Math.min(10, n)) : fallback;
}

export async function POST(req: NextRequest) {
  const { conversationId, questions } = (await req.json()) as {
    conversationId: string;
    questions: InterviewQuestion[];
  };

  if (!conversationId || !Array.isArray(questions)) {
    return NextResponse.json({ error: "Missing conversationId or questions." }, { status: 400 });
  }

  try {
    const analysis = await getConversationAnalysis(conversationId);
    const dc = analysis.dataCollectionResults ?? {};

    const scores: QuestionScore[] = questions.map((q, i) => {
      const n = i + 1;
      const scoreField = dc[`q${n}_score`];
      const feedbackField = dc[`q${n}_feedback`];
      return {
        questionId: q.id,
        question: q.text,
        score: toNumber(scoreField?.value),
        feedback: feedbackField?.value ? String(feedbackField.value) : (scoreField?.rationale ?? ""),
      };
    });

    const average = scores.length ? scores.reduce((s, q) => s + q.score, 0) / scores.length : 0;

    const result: SessionResult = {
      id: conversationId,
      completedAt: new Date().toISOString(),
      scores,
      average: Math.round(average * 10) / 10,
      strengths: splitList(dc["strengths"]?.value as string | undefined),
      weaknesses: splitList(dc["weaknesses"]?.value as string | undefined),
      summary: (dc["summary"]?.value as string) ?? analysis.transcriptSummary ?? "",
    };

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch session analysis" },
      { status: 500 }
    );
  }
}
