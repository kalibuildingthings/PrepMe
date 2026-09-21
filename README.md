# PrepMe

A voice-first PWA that preps you for the interview you just got invited to. You give it the job description and your resume, pick a storytelling framework (STAR / STAR-L / SOAR / DIGS), and then talk through 10 tailored interview questions out loud — great for prepping on a walk.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Hand-rolled installable PWA (manifest + service worker, no extra build plugin)
- [ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai) for the entire voice loop: STT, the interviewer's LLM, and TTS
- zustand (persisted to localStorage) for app state — no backend database in this MVP

## How the ElevenLabs integration works

Everything voice-related is one ElevenLabs Conversational AI **agent** that you create once in the [ElevenLabs dashboard](https://elevenlabs.io/app/conversational-ai). The app talks to it in two ways:

1. **Question generation** (`lib/elevenlabs/server.ts` → `simulateAgentText`): before the live call, the server runs a short text-only turn against the same agent (`/v1/convai/agents/{id}/simulate-conversation`) asking it to read the JD + resume and return the 10 likely questions and gap analysis as JSON.
2. **The live interview** (`lib/elevenlabs/client.ts` + `app/session/page.tsx`): the browser opens a private WebSocket session to the agent via a server-issued signed URL, so your API key never reaches the client. The JD, resume, gaps, prep method, and question list are passed in as **dynamic variables** so your agent's system prompt can reference them.
3. **Scoring** (`app/api/session/analysis/route.ts`): after the call ends, the server fetches `GET /v1/convai/conversations/{id}` and reads whatever the agent's configured "data collection" extracted from the transcript.

### Setting up the agent

In the ElevenLabs dashboard, create one agent (e.g. "PrepMe Interviewer") and configure:

**System prompt** — reference the dynamic variables this app sends:

```
If the user's message starts with "SYSTEM: GENERATE_QUESTIONS", ignore every other
instruction in this prompt and do only this: read the job description and resume
included in that message, then reply with ONLY compact JSON, no markdown, no
commentary, in this exact shape:
{"gaps": ["...", "..."], "questions": [{"text": "...", "rationale": "..."}, ... exactly 10 items]}

Otherwise, you are conducting a mock interview to help the candidate prepare.
Job description: {{jd_text}}
Candidate resume: {{resume_text}}
Known gaps to probe gently: {{gaps}}
Storytelling framework the candidate should use: {{prep_method}}
The 10 questions to ask, in order (JSON): {{questions_json}}

Ask each of the 10 questions one at a time, in a natural, encouraging interviewer
voice. After each answer, give one brief, constructive follow-up or move on. Coach
them toward the {{prep_method}} structure if their answer is unfocused. After the
10th question, thank them and wrap up.
```

**Data collection** (Agent settings → Analysis) — add one field per question plus summary fields, with these **exact names** (the scoring API reads them):

- `q1_score` … `q10_score` — number, 0–10, "How well did the candidate answer question N using the {{prep_method}} structure?"
- `q1_feedback` … `q10_feedback` — text (optional), one-sentence feedback per answer
- `strengths` — text, "2-3 things the candidate did well across the interview, one per line"
- `weaknesses` — text, "2-3 things to improve, one per line"
- `summary` — text, a short overall summary of performance

The first-message/greeting can be static ("Hi, thanks for taking the time — let's get started.") or dynamic; either works.

The `SYSTEM: GENERATE_QUESTIONS` block at the top matters: the question-generation call (see above) reuses this same agent, so without an explicit instruction to break character, the agent just responds in its interviewer persona instead of returning JSON — which surfaces as "The interviewer agent didn't return a parseable question set." If you still see that error after adding this block, the app now includes a preview of the agent's actual reply in the error message so you can see what it said and adjust the prompt further.

### Environment variables

Copy `.env.example` to `.env.local`:

```
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...
```

Both are server-only — never exposed to the browser.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Open http://localhost:3000. Voice sessions need microphone access, so use `https://` or `localhost` (both count as secure contexts).

## App flow

1. **Onboarding** (`/onboarding/jd-resume` → `/onboarding/prep-method` → `/onboarding/ready`): collect the JD (link or pasted text), resume upload (PDF/DOCX/TXT, parsed server-side), and prep framework. This triggers the question-generation call.
2. **Dashboard** (`/dashboard`): shows the identified gaps, the 10 questions, remaining practice time for the day/week, and a Start button.
3. **Session** (`/session`): the live voice conversation. A local timer enforces the plan's time limit and auto-ends the call when it runs out.
4. **Results** (`/results`): overall average, a strengths/weaknesses summary, and a per-question 0–10 score with feedback.
5. **Pricing** (`/pricing`): plan picker — Free (1h/day), Plus ($10/mo, $8/mo billed yearly — 72h/week), Unlimited ($30/mo, $25/mo billed yearly).

## Known limitations / next steps

- **No auth or database.** All state (onboarding answers, usage, results) lives in the browser's localStorage via zustand's `persist`. A real launch needs accounts + a database so history and usage survive across devices.
- **No payment processor.** The pricing page switches your local plan/time-limit for demo purposes only; wiring up Stripe (checkout + webhooks to set the tier) is the natural next step.
- **PWA icons** are placeholder generated marks (`public/icons/`) — swap in real branded icons before shipping.
- **Resume/JD parsing** is best-effort (`pdf-parse`, `mammoth`, `cheerio`); very unusual PDF layouts or JS-rendered job pages may need the "paste text instead" fallback that's built into the JD step.
