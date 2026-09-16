"use client";

import { useRef, useState } from "react";

export function FileDropzone({
  onFile,
  fileName,
  accept = ".pdf,.docx,.txt",
}: {
  onFile: (file: File) => void;
  fileName?: string;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
        dragging ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <svg viewBox="0 0 24 24" fill="none" className="mb-2 h-8 w-8 text-brand-500">
        <path
          d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {fileName ? (
        <p className="text-sm font-medium text-ink">{fileName}</p>
      ) : (
        <>
          <p className="text-sm font-medium text-ink">Tap to upload your resume</p>
          <p className="mt-1 text-xs text-slate-400">PDF, DOCX, or TXT</p>
        </>
      )}
    </div>
  );
}
