import { BillingCycle, Tier, TierDefinition } from "@/lib/types";

export function TierCard({
  tier,
  active,
  cycle,
  onSelect,
}: {
  tier: TierDefinition;
  active: boolean;
  cycle: BillingCycle;
  onSelect: (id: Tier) => void;
}) {
  const price = tier.price ? tier.price[cycle] : 0;

  return (
    <div className={`card ${active ? "border-brand-400 ring-2 ring-brand-100" : ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink">{tier.name}</h3>
        {active && <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">Current</span>}
      </div>

      <p className="mt-2 text-3xl font-extrabold text-ink">
        {tier.price ? `$${price}` : "Free"}
        {tier.price && <span className="text-sm font-medium text-slate-400">/mo</span>}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {tier.weeklyMinutes === null
          ? "Unlimited talk time"
          : tier.id === "free"
          ? "1 hour of talk time per day"
          : `${tier.weeklyMinutes / 60} hours of talk time per week`}
      </p>

      <button
        onClick={() => onSelect(tier.id)}
        disabled={active}
        className={active ? "btn-secondary mt-4 w-full opacity-60" : "btn-primary mt-4 w-full"}
      >
        {active ? "Selected" : tier.price ? "Choose plan" : "Use free plan"}
      </button>
    </div>
  );
}
