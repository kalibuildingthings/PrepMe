export function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 px-6 pt-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < step ? "bg-brand-500" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}
