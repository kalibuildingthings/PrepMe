"use client";

import { useRouter } from "next/navigation";
import { usePrepMeStore } from "@/lib/store";

export default function ReadyPage() {
  const router = useRouter();
  const questionCount = usePrepMeStore((s) => s.questions.length);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-emerald-500">
          <path
            d="m5 13 4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-ink">Congrats — now let's start prepping you to land that role.</h1>
      <p className="mt-3 text-sm text-slate-500">
        We've analyzed the role and your resume and lined up {questionCount || 10} likely interview questions.
      </p>
      <button onClick={() => router.push("/dashboard")} className="btn-primary mt-8 w-full max-w-xs">
        See my questions
      </button>
    </main>
  );
}
