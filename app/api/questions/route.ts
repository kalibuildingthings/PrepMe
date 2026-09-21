import { NextRequest, NextResponse } from "next/server";
import { getAgentTextReply } from "@/lib/elevenlabs/server";
import { InterviewQuestion } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function buildPrompt(jdText: string, resumeText: string, prepMethod: string) {
  return `SYSTEM: GENERATE_QUESTIONS
Read the job description and resume below, identify the 3-6 biggest gaps between what the role wants and what the resume shows (skills, experience depth, missing keywords), then write the 10 interview questions this candidate is most likely to be asked. The candidate will answer using the ${prepMethod} storytelling framework.

JOB DESCRIPTION:
${jdText}

RESUME:
${resumeText}

Respond with ONLY compact JSON, no markdown, in this exact shape:
{"gaps": ["...", "..."], "questions": [{"text": "...", "rationale": "..."}, ... exactly 10 items]}`;
}

function extractJson(raw: string): { gaps: string[]; questions: { text: string; rationale: string }[] } | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { jdText, resumeText, prepMethod } = await req.json();

  if (!jdText || !resumeText || !prepMethod) {
    return NextResponse.json({ error: "Missing jdText, resumeText, or prepMethod." }, { status: 400 });
  }

  try {
    const raw = await getAgentTextReply(buildPrompt(jdText, resumeText, prepMethod));
    const parsed = extractJson(raw);

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json(
        {
          error:
            "The interviewer agent didn't return a parseable question set. Check your agent's system prompt (see README.md).",
          agentResponsePreview: raw.slice(0, 500),
        },
        { status: 502 }
      );
    }

    const questions: InterviewQuestion[] = parsed.questions.slice(0, 10).map((q, i) => ({
      id: `q${i + 1}`,
      text: q.text,
      rationale: q.rationale ?? "",
    }));

    return NextResponse.json({ gaps: parsed.gaps ?? [], questions });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate questions" },
      { status: 500 }
    );
  }
}
