"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stepper } from "@/components/Stepper";
import { FileDropzone } from "@/components/FileDropzone";
import { usePrepMeStore } from "@/lib/store";

export default function JdResumePage() {
  const router = useRouter();
  const { jdUrl, resumeFileName, setJd, setResume } = usePrepMeStore();
  const [url, setUrl] = useState(jdUrl);
  const [jdMode, setJdMode] = useState<"link" | "paste">("link");
  const [pastedJd, setPastedJd] = useState("");
  const [fileName, setFileName] = useState(resumeFileName);
  const [loadingJd, setLoadingJd] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);
  const [error, setError] = useState("");

  const jdReady = usePrepMeStore((s) => !!s.jdText);
  const resumeReady = usePrepMeStore((s) => !!s.resumeText);

  async function handleFetchJd() {
    setError("");
    setLoadingJd(true);
    try {
      const res = await fetch("/api/parse-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJd(url, data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that link.");
    } finally {
      setLoadingJd(false);
    }
  }

  async function handleUploadResume(file: File) {
    setError("");
    setLoadingResume(true);
    setFileName(file.name);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResume(data.fileName, data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that resume.");
    } finally {
      setLoadingResume(false);
    }
  }

  const canContinue = jdReady && resumeReady;

  return (
    <main className="flex min-h-screen flex-col">
      <Stepper step={1} total={3} />
      <div className="flex-1 space-y-6 px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">The job &amp; your resume</h1>
          <p className="mt-1 text-sm text-slate-500">
            We'll scan both to find gaps and shape your interview questions.
          </p>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-ink">Job description</label>
            <button
              className="text-xs font-medium text-brand-500"
              onClick={() => setJdMode(jdMode === "link" ? "paste" : "link")}
            >
              {jdMode === "link" ? "Paste text instead" : "Use a link instead"}
            </button>
          </div>

          {jdMode === "link" ? (
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="https://company.com/careers/job/123"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                onClick={handleFetchJd}
                disabled={!url || loadingJd}
                className="btn-secondary shrink-0 px-4"
              >
                {loadingJd ? "..." : "Fetch"}
              </button>
            </div>
          ) : (
            <textarea
              className="textarea min-h-[120px]"
              placeholder="Paste the full job description here"
              value={pastedJd}
              onChange={(e) => {
                setPastedJd(e.target.value);
                setJd("", e.target.value);
              }}
            />
          )}
          {jdReady && <p className="text-xs font-medium text-emerald-600">✓ Job description loaded</p>}
        </section>

        <section className="space-y-3">
          <label className="text-sm font-semibold text-ink">Your resume</label>
          <FileDropzone onFile={handleUploadResume} fileName={loadingResume ? "Reading..." : fileName} />
          {resumeReady && <p className="text-xs font-medium text-emerald-600">✓ Resume loaded</p>}
        </section>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="px-6 pb-8">
        <button
          disabled={!canContinue}
          onClick={() => router.push("/onboarding/prep-method")}
          className="btn-primary w-full"
        >
          Continue
        </button>
      </div>
    </main>
  );
}
