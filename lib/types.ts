export type PrepMethod = "STAR" | "STAR-L" | "SOAR" | "DIGS";

export interface InterviewQuestion {
  id: string;
  text: string;
  rationale: string;
}

export interface QuestionScore {
  questionId: string;
  question: string;
  score: number; // 0-10
  feedback: string;
}

export interface SessionResult {
  id: string;
  completedAt: string;
  scores: QuestionScore[];
  average: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export type Tier = "free" | "plus" | "unlimited";
export type BillingCycle = "monthly" | "yearly";

export interface TierDefinition {
  id: Tier;
  name: string;
  weeklyMinutes: number | null; // null = unlimited
  price: { monthly: number; yearly: number } | null; // null = free
}

export interface OnboardingState {
  jdUrl: string;
  jdText: string;
  resumeFileName: string;
  resumeText: string;
  prepMethod: PrepMethod | null;
  gaps: string[];
  questions: InterviewQuestion[];
  onboardingComplete: boolean;
}
