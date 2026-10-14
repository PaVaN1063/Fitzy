import { Activity, Goal, LogEntry, Macros, Profile, Targets, WeightEntry } from './models';

/** Multipliers applied to BMR to estimate total daily energy expenditure. */
export const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: 'Desk job, little exercise',
  light: 'Gym 1–3 days a week',
  moderate: 'Gym 3–5 days a week',
  active: 'Gym 6–7 days a week',
  very_active: 'Hard training + physical job',
};

/** Calorie change applied to maintenance for each goal. */
export const GOAL_ADJUST: Record<Goal, number> = {
  cut: -0.2,
  maintain: 0,
  bulk: 0.1,
};

export const GOAL_LABELS: Record<Goal, string> = {
  cut: 'Lose fat',
  maintain: 'Maintain',
  bulk: 'Build muscle',
};

/** Suggested protein (g per kg body weight) for each goal; lifters do best around 1.6–2.2. */
export const DEFAULT_PROTEIN_PER_KG: Record<Goal, number> = {
  cut: 2.2,
  maintain: 1.8,
  bulk: 2.0,
};

const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 };

/** Sex constant in Mifflin–St Jeor; "other" uses the midpoint of the male and female values. */
const SEX_OFFSET = { male: 5, female: -161, other: -78 };

/** Mifflin–St Jeor resting energy expenditure, kcal/day. */
export function bmr(p: Pick<Profile, 'sex' | 'age' | 'heightCm' | 'weightKg'>): number {
  return 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + SEX_OFFSET[p.sex];
}

export function tdee(p: Profile): number {
  return bmr(p) * ACTIVITY_FACTORS[p.activity];
}

/** Daily water goal: 35 ml per kg, plus 500 ml on gym days, rounded to 50 ml. */
export function waterGoalMl(weightKg: number, gymDay: boolean): number {
  const ml = weightKg * 35 + (gymDay ? 500 : 0);
  return Math.round(ml / 50) * 50;
}

export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return m > 0 ? weightKg / (m * m) : 0;
}

export function bmiLabel(value: number): string {
  if (value < 18.5) { return 'Underweight'; }
  if (value < 25) { return 'Healthy range'; }
  if (value < 30) { return 'Overweight'; }
  return 'Obese range';
}

/**
 * Daily targets. Calories: TDEE adjusted for the goal, never below a safe floor.
 * Protein: proteinPerKg × weight. Fat: 25% of calories, at least 0.6 g/kg. Carbs: the rest.
 */
export function targets(p: Profile, gymDay = false): Targets {
  const b = bmr(p);
  const t = b * ACTIVITY_FACTORS[p.activity];
  const floor = p.sex === 'male' ? 1500 : 1200;
  const kcal = Math.max(floor, t * (1 + GOAL_ADJUST[p.goal]));

  const protein = p.weightKg * p.proteinPerKg;
  const fat = Math.max(p.weightKg * 0.6, (kcal * 0.25) / KCAL_PER_G.fat);
  const carbs = Math.max(0, (kcal - protein * KCAL_PER_G.protein - fat * KCAL_PER_G.fat) / KCAL_PER_G.carbs);

  return {
    bmr: Math.round(b),
    tdee: Math.round(t),
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    waterMl: waterGoalMl(p.weightKg, gymDay),
  };
}

export function sumMacros(entries: Macros[]): Macros {
  const total = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  return {
    kcal: Math.round(total.kcal),
    protein: round1(total.protein),
    carbs: round1(total.carbs),
    fat: round1(total.fat),
  };
}

export function scaleMacros(m: Macros, qty: number): Macros {
  return {
    kcal: Math.round(m.kcal * qty),
    protein: round1(m.protein * qty),
    carbs: round1(m.carbs * qty),
    fat: round1(m.fat * qty),
  };
}

/** Calories implied by the macros, for sanity-checking custom foods. */
export function kcalFromMacros(m: Pick<Macros, 'protein' | 'carbs' | 'fat'>): number {
  return Math.round(m.protein * KCAL_PER_G.protein + m.carbs * KCAL_PER_G.carbs + m.fat * KCAL_PER_G.fat);
}

export function entriesForMeal(entries: LogEntry[], meal: LogEntry['meal']): LogEntry[] {
  return entries.filter(e => e.meal === meal);
}

/**
 * Trailing 7-day average for each weigh-in, using every weigh-in in the 7 days ending on that date.
 * Entries must be sorted oldest first.
 */
export function weightTrend(entries: WeightEntry[]): { date: string; kg: number; avg: number }[] {
  return entries.map(e => {
    const end = Date.parse(e.date);
    const window = entries.filter(o => {
      const t = Date.parse(o.date);
      return t <= end && end - t < 7 * 86400000;
    });
    const avg = window.reduce((s, o) => s + o.kg, 0) / window.length;
    return { date: e.date, kg: e.kg, avg: round1(avg) };
  });
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
