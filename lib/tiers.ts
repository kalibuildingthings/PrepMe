import { TierDefinition } from "./types";

export const TIERS: TierDefinition[] = [
  {
    id: "free",
    name: "Free",
    weeklyMinutes: 7 * 60, // 1h/day cap enforced separately; weekly ceiling matches 7h
    price: null,
  },
  {
    id: "plus",
    name: "Plus",
    weeklyMinutes: 72 * 60,
    price: { monthly: 10, yearly: 8 },
  },
  {
    id: "unlimited",
    name: "Unlimited",
    weeklyMinutes: null,
    price: { monthly: 30, yearly: 25 },
  },
];

export const FREE_DAILY_LIMIT_MINUTES = 60;

export function tierById(id: string): TierDefinition {
  return TIERS.find((t) => t.id === id) ?? TIERS[0];
}
