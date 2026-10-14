import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { addDays, fromKey, todayKey } from './dates';
import { DEMO_SCAN_PRODUCTS, FOODS, fitsDiet } from './foods';
import { DayLog, Food, LogEntry, MealType, Profile, Settings, Targets, WeightEntry } from './models';
import { DEFAULT_PROTEIN_PER_KG, scaleMacros, sumMacros, targets } from './nutrition';

interface AppState {
  version: 2;
  profile: Profile;
  settings: Settings;
  days: { [date: string]: DayLog };
  weights: WeightEntry[];
  customFoods: Food[];
  recentFoodIds: string[];
}

const STORAGE_KEY = 'efacm.state.v2';

/**
 * Sample account shown on first launch. Rahul is a made-up person; the email uses the
 * reserved example.com domain and the phone number is a placeholder.
 */
export const DEMO_PROFILE: Profile = {
  name: 'Rahul Varma',
  email: 'rahul.varma@example.com',
  phone: '+91 98765 43210',
  city: 'Bengaluru',
  diet: 'nonveg',
  memberSince: '2026-08-03',
  sex: 'male',
  age: 27,
  heightCm: 176,
  weightKg: 74.6,
  activity: 'moderate',
  goal: 'cut',
  proteinPerKg: DEFAULT_PROTEIN_PER_KG.cut,
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  units: 'metric',
  notify: { meals: true, water: true, weekly: false },
};

export interface ProfileStats {
  streak: number;
  daysLogged: number;
  foodsLogged: number;
  weighIns: number;
  litres: number;
}

/**
 * All app data lives on the phone (localStorage inside the app's web view).
 * Every change is saved immediately and announced on `changes$`.
 */
@Injectable({ providedIn: 'root' })
export class TrackerService {
  private state: AppState;
  private readonly changes = new BehaviorSubject<number>(0);

  /** Emits after every change; pages re-read what they need. */
  readonly changes$: Observable<number> = this.changes.asObservable();

  constructor() {
    this.state = this.load() ?? buildDemoState();
    this.save();
  }

  // ---------- profile & targets ----------

  get profile(): Profile {
    return this.state.profile;
  }

  saveProfile(p: Profile): void {
    this.state.profile = { ...p };
    this.commit();
  }

  updateProfile(changes: Partial<Profile>): void {
    this.state.profile = { ...this.state.profile, ...changes };
    this.commit();
  }

  get settings(): Settings {
    return this.state.settings;
  }

  updateSettings(changes: Partial<Settings>): void {
    this.state.settings = { ...this.state.settings, ...changes };
    this.commit();
  }

  /** Streak = consecutive days with food logged, ending today (or yesterday if today is still empty). */
  stats(): ProfileStats {
    const days = Object.keys(this.state.days).map(k => this.state.days[k]);
    const logged = new Set(days.filter(d => d.entries.length > 0).map(d => d.date));
    let streak = 0;
    let cursor = todayKey();
    if (!logged.has(cursor)) { cursor = addDays(cursor, -1); }
    while (logged.has(cursor)) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return {
      streak,
      daysLogged: logged.size,
      foodsLogged: days.reduce((n, d) => n + d.entries.length, 0),
      weighIns: this.state.weights.length,
      litres: Math.round(days.reduce((n, d) => n + d.water.reduce((s, w) => s + w.ml, 0), 0) / 100) / 10,
    };
  }

  targetsFor(date: string): Targets {
    return targets(this.state.profile, this.day(date).gymDay);
  }

  // ---------- days ----------

  /** The log for a date. Returns an empty day if nothing was logged yet (not saved until changed). */
  day(date: string): DayLog {
    return this.state.days[date] ?? { date, entries: [], water: [], gymDay: false };
  }

  private mutableDay(date: string): DayLog {
    if (!this.state.days[date]) {
      this.state.days[date] = { date, entries: [], water: [], gymDay: false };
    }
    return this.state.days[date];
  }

  setGymDay(date: string, gymDay: boolean): void {
    this.mutableDay(date).gymDay = gymDay;
    this.commit();
  }

  // ---------- food log ----------

  addFood(date: string, meal: MealType, food: Food, qty: number): void {
    const macros = scaleMacros(food, qty);
    const entry: LogEntry = {
      id: uid(),
      foodId: food.id,
      name: food.name,
      serving: food.serving,
      meal,
      qty,
      at: Date.now(),
      ...macros,
    };
    this.mutableDay(date).entries.push(entry);
    this.state.recentFoodIds = [food.id, ...this.state.recentFoodIds.filter(id => id !== food.id)].slice(0, 8);
    this.commit();
  }

  removeEntry(date: string, entryId: string): void {
    const d = this.mutableDay(date);
    d.entries = d.entries.filter(e => e.id !== entryId);
    this.commit();
  }

  /** Copies every food from one day into another (e.g. "copy yesterday"). Returns how many were copied. */
  copyDay(fromDate: string, toDate: string): number {
    const source = this.day(fromDate).entries;
    const target = this.mutableDay(toDate);
    source.forEach(e => target.entries.push({ ...e, id: uid(), at: Date.now() }));
    this.commit();
    return source.length;
  }

  // ---------- foods ----------

  /** Built-in and custom foods that fit the user's diet preference (custom foods always show). */
  allFoods(): Food[] {
    const diet = this.state.profile.diet;
    return [...this.state.customFoods, ...FOODS.filter(f => fitsDiet(f, diet))];
  }

  recentFoods(): Food[] {
    const all = [...this.allFoods(), ...DEMO_SCAN_PRODUCTS];
    return this.state.recentFoodIds
      .map(id => all.find(f => f.id === id))
      .filter((f): f is Food => !!f);
  }

  addCustomFood(food: Omit<Food, 'id' | 'category'>): Food {
    const created: Food = { ...food, id: 'custom-' + uid(), category: 'custom' };
    this.state.customFoods.unshift(created);
    this.commit();
    return created;
  }

  // ---------- water ----------

  addWater(date: string, ml: number): void {
    this.mutableDay(date).water.push({ ml, at: Date.now() });
    this.commit();
  }

  undoWater(date: string): void {
    this.mutableDay(date).water.pop();
    this.commit();
  }

  waterTotal(date: string): number {
    return this.day(date).water.reduce((s, w) => s + w.ml, 0);
  }

  // ---------- weight ----------

  get weights(): WeightEntry[] {
    return this.state.weights;
  }

  /** Logs (or replaces) the weigh-in for a date and keeps the profile weight current. */
  logWeight(date: string, kg: number): void {
    const rest = this.state.weights.filter(w => w.date !== date);
    this.state.weights = [...rest, { date, kg }].sort((a, b) => a.date.localeCompare(b.date));
    const latest = this.state.weights[this.state.weights.length - 1];
    this.state.profile = { ...this.state.profile, weightKg: latest.kg };
    this.commit();
  }

  removeWeight(date: string): void {
    this.state.weights = this.state.weights.filter(w => w.date !== date);
    this.commit();
  }

  // ---------- summaries ----------

  totals(date: string) {
    return sumMacros(this.day(date).entries);
  }

  // ---------- reset ----------

  resetToDemo(): void {
    this.state = buildDemoState();
    this.commit();
  }

  /** Deletes all logs but keeps the account details and settings. */
  clearAll(): void {
    this.state = { ...this.state, days: {}, weights: [], customFoods: [], recentFoodIds: [] };
    this.commit();
  }

  /** Starts a brand-new, empty account (used by sign-up). */
  startFreshAccount(name: string, email: string): void {
    this.state = {
      version: 2,
      profile: { ...DEMO_PROFILE, name, email, phone: '', city: '', memberSince: todayKey(), weightKg: 70, age: 25, heightCm: 170, goal: 'maintain', proteinPerKg: DEFAULT_PROTEIN_PER_KG.maintain },
      settings: { ...this.state.settings },
      days: {},
      weights: [],
      customFoods: [],
      recentFoodIds: [],
    };
    this.commit();
  }

  /** Everything stored on the phone, as JSON text. */
  exportJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  // ---------- persistence ----------

  private commit(): void {
    this.save();
    this.changes.next(this.changes.value + 1);
  }

  private load(): AppState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { return null; }
      const parsed = JSON.parse(raw) as AppState;
      return parsed && parsed.version === 2 ? parsed : null;
    } catch {
      return null;
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage full or unavailable: keep working in memory.
    }
  }
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Sample data so every screen has something to show on first launch:
 * Rahul, three weeks into a fat-loss phase, logging home-style Indian meals.
 */
function buildDemoState(): AppState {
  const today = todayKey();
  const find = (id: string): Food => FOODS.find(f => f.id === id) as Food;
  type Plan = [MealType, string, number][];

  const plans: Plan[] = [
    [['breakfast', 'oats-milk', 1], ['breakfast', 'boiled-egg', 3], ['lunch', 'roti', 3], ['lunch', 'chicken-curry', 1], ['lunch', 'curd', 1],
     ['snacks', 'whey', 1], ['snacks', 'banana', 1], ['dinner', 'white-rice', 1], ['dinner', 'chicken-breast', 1.5], ['dinner', 'mixed-veg', 1]],
    [['breakfast', 'idli', 4], ['breakfast', 'sambar', 1], ['breakfast', 'omelette', 1], ['lunch', 'chicken-biryani', 1], ['lunch', 'buttermilk', 1],
     ['snacks', 'whey', 1], ['snacks', 'roasted-chana', 1], ['dinner', 'roti', 2], ['dinner', 'palak-paneer', 1], ['dinner', 'egg-white', 4]],
    [['breakfast', 'poha', 1], ['breakfast', 'greek-yogurt', 2], ['breakfast', 'apple', 1], ['lunch', 'brown-rice', 1], ['lunch', 'fish-curry', 1],
     ['lunch', 'sprouts', 1], ['snacks', 'whey', 1], ['snacks', 'almonds', 2], ['dinner', 'roti', 3], ['dinner', 'soya-chunks', 1], ['dinner', 'toor-dal', 1]],
    [['breakfast', 'aloo-paratha', 2], ['breakfast', 'curd', 1], ['breakfast', 'chai', 1], ['lunch', 'chicken-biryani', 1], ['snacks', 'samosa', 1],
     ['snacks', 'chai', 1], ['dinner', 'chicken-curry', 1], ['dinner', 'roti', 3]],
  ];
  const mealHour: Record<MealType, number> = { breakfast: 8, lunch: 13, snacks: 17, dinner: 21 };

  const at = (date: string, hour: number, minute = 0): number => {
    const d = fromKey(date);
    d.setHours(hour, minute, 0, 0);
    return d.getTime();
  };
  const makeEntries = (date: string, plan: Plan): LogEntry[] =>
    plan.map(([meal, id, qty], k) => {
      const f = find(id);
      return { id: uid() + date + k, foodId: id, name: f.name, serving: f.serving, meal, qty, at: at(date, mealHour[meal], k * 3), ...scaleMacros(f, qty) };
    });

  const days: { [date: string]: DayLog } = {};
  for (let i = 13; i >= 1; i--) {
    const date = addDays(today, -i);
    const glasses = [9, 11, 8, 12, 10, 7, 11][i % 7];
    days[date] = {
      date,
      entries: makeEntries(date, plans[i % plans.length]),
      water: Array.from({ length: glasses }, (_, k) => ({ ml: 300, at: at(date, 7 + Math.round(k * 1.4), 15) })),
      gymDay: i % 7 !== 0 && i % 7 !== 4,
    };
  }

  // Today so far: breakfast and a post-workout shake.
  const now = Date.now();
  days[today] = {
    date: today,
    gymDay: true,
    entries: makeEntries(today, [['breakfast', 'oats-milk', 1], ['breakfast', 'boiled-egg', 3], ['snacks', 'whey', 1], ['snacks', 'banana', 1]])
      .map((e, k) => ({ ...e, at: Math.min(e.at, now - (4 - k) * 600000) })),
    water: [500, 250, 500, 250].map((ml, k) => ({ ml, at: now - (4 - k) * 2400000 })),
  };

  // Three weeks of morning weigh-ins: about 0.7 kg a week down, with normal day-to-day swings.
  const noise = [0.2, -0.1, 0.3, 0, -0.2, 0.4, 0.1, -0.1, 0.2, -0.3, 0.1, 0.3, -0.2, 0, 0.2, -0.1, 0.3, -0.2, 0.1, 0, -0.1];
  const weights: WeightEntry[] = noise
    .map((n, k) => ({ date: addDays(today, -(noise.length - 1 - k)), kg: Math.round((76.8 - k * 0.105 + n) * 10) / 10 }))
    .filter((_, k) => k % 6 !== 4); // skipped a few mornings

  return {
    version: 2,
    profile: { ...DEMO_PROFILE, memberSince: addDays(today, -73), weightKg: weights[weights.length - 1].kg },
    settings: { ...DEFAULT_SETTINGS },
    days,
    weights,
    customFoods: [],
    recentFoodIds: ['whey', 'oats-milk', 'boiled-egg', 'roti', 'chicken-curry', 'chicken-breast', 'toor-dal', 'curd'],
  };
}
