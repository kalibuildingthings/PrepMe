"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BillingCycle, InterviewQuestion, OnboardingState, PrepMethod, SessionResult, Tier } from "./types";
import { todayKey, UsageLog } from "./usage";

const emptyOnboarding: OnboardingState = {
  jdUrl: "",
  jdText: "",
  resumeFileName: "",
  resumeText: "",
  prepMethod: null,
  gaps: [],
  questions: [],
  onboardingComplete: false,
};

interface PrepMeState extends OnboardingState {
  tier: Tier;
  billingCycle: BillingCycle;
  usage: UsageLog;
  results: SessionResult[];
  activeSessionMinutesUsed: number;

  setJd: (jdUrl: string, jdText: string) => void;
  setResume: (fileName: string, text: string) => void;
  setPrepMethod: (method: PrepMethod) => void;
  setGapsAndQuestions: (gaps: string[], questions: InterviewQuestion[]) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  setTier: (tier: Tier, cycle?: BillingCycle) => void;
  logMinutesUsed: (minutes: number) => void;
  addResult: (result: SessionResult) => void;
}

export const usePrepMeStore = create<PrepMeState>()(
  persist(
    (set, get) => ({
      ...emptyOnboarding,
      tier: "free",
      billingCycle: "monthly",
      usage: { minutesByDay: {} },
      results: [],
      activeSessionMinutesUsed: 0,

      setJd: (jdUrl, jdText) => set({ jdUrl, jdText }),
      setResume: (resumeFileName, resumeText) => set({ resumeFileName, resumeText }),
      setPrepMethod: (prepMethod) => set({ prepMethod }),
      setGapsAndQuestions: (gaps, questions) => set({ gaps, questions }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetOnboarding: () => set({ ...emptyOnboarding }),

      setTier: (tier, cycle) => set({ tier, billingCycle: cycle ?? get().billingCycle }),
      logMinutesUsed: (minutes) => {
        const log = get().usage;
        const key = todayKey();
        const updated = {
          minutesByDay: { ...log.minutesByDay, [key]: (log.minutesByDay[key] ?? 0) + minutes },
        };
        set({ usage: updated });
      },
      addResult: (result) => set({ results: [result, ...get().results] }),
    }),
    { name: "prepme-storage" }
  )
);
