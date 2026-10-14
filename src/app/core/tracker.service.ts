import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { addDays, todayKey } from './dates';
import { DEMO_SCAN_PRODUCTS, FOODS } from './foods';
import { DayLog, Food, LogEntry, MealType, Profile, Targets, WeightEntry } from './models';
import { DEFAULT_PROTEIN_PER_KG, scaleMacros, sumMacros, targets } from './nutrition';

interface AppState {
  version: 1;
  profile: Profile;
  days: { [date: string]: DayLog };
  weights: WeightEntry[];
  customFoods: Food[];
  recentFoodIds: string[];
}

const STORAGE_KEY = 'efacm.state.v1';

export const DEFAULT_PROFILE: Profile = {
  name: 'Demo Lifter',
  sex: 'male',
  age: 25,
  heightCm: 175,
  weightKg: 72,
  activity: 'moderate',
  goal: 'maintain',
  proteinPerKg: DEFAULT_PROTEIN_PER_KG.maintain,
};

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

  allFoods(): Food[] {
    return [...this.state.customFoods, ...FOODS];
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

  clearAll(): void {
    this.state = { version: 1, profile: { ...DEFAULT_PROFILE }, days: {}, weights: [], customFoods: [], recentFoodIds: [] };
    this.commit();
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
      return parsed && parsed.version === 1 ? parsed : null;
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

/** Sample data so every screen has something to show on first launch. */
function buildDemoState(): AppState {
  const today = todayKey();
  const find = (id: string): Food => FOODS.find(f => f.id === id) as Food;

  const plan: [MealType, string, number][][] = [
    [['breakfast', 'oats-milk', 1], ['breakfast', 'banana', 1], ['lunch', 'roti', 3], ['lunch', 'toor-dal', 1], ['lunch', 'chicken-curry', 1], ['snacks', 'whey', 1], ['dinner', 'white-rice', 1], ['dinner', 'paneer', 1], ['dinner', 'mixed-veg', 1]],
    [['breakfast', 'idli', 4], ['breakfast', 'sambar', 1], ['lunch', 'chicken-biryani', 1], ['snacks', 'roasted-chana', 1], ['snacks', 'whey', 1], ['dinner', 'roti', 2], ['dinner', 'rajma', 1], ['dinner', 'curd', 1]],
    [['breakfast', 'omelette', 1], ['breakfast', 'brown-bread', 2], ['lunch', 'white-rice', 1], ['lunch', 'chicken-breast', 1.5], ['lunch', 'mixed-veg', 1], ['snacks', 'almonds', 2], ['dinner', 'roti', 3], ['dinner', 'palak-paneer', 1]],
  ];

  const days: { [date: string]: DayLog } = {};
  let t = Date.now() - 7 * 86400000;
  for (let i = 6; i >= 1; i--) {
    const date = addDays(today, -i);
    const entries: LogEntry[] = plan[i % plan.length].map(([meal, id, qty]) => {
      const f = find(id);
      t += 60000;
      return { id: uid() + i, foodId: id, name: f.name, serving: f.serving, meal, qty, at: t, ...scaleMacros(f, qty) };
    });
    const glasses = 9 + (i % 4);
    days[date] = {
      date,
      entries,
      water: Array.from({ length: glasses }, (_, k) => ({ ml: 300, at: t + k * 3600000 })),
      gymDay: i % 7 !== 3 && i % 7 !== 6,
    };
  }

  const now = Date.now();
  days[today] = {
    date: today,
    gymDay: true,
    entries: [['breakfast', 'oats-milk', 1], ['breakfast', 'boiled-egg', 2], ['snacks', 'whey', 1]].map(([meal, id, qty], k) => {
      const f = find(id as string);
      return { id: uid() + 't' + k, foodId: f.id, name: f.name, serving: f.serving, meal: meal as MealType, qty: qty as number, at: now - (3 - k) * 3600000, ...scaleMacros(f, qty as number) };
    }),
    water: [500, 250, 500].map((ml, k) => ({ ml, at: now - (3 - k) * 3600000 })),
  };

  // Gentle downward trend with day-to-day noise.
  const noise = [0.3, -0.2, 0.4, -0.1, 0.2, -0.3, 0.1, 0.3, -0.2, 0, 0.2, -0.1, 0.1, -0.2];
  const weights: WeightEntry[] = noise.map((n, k) => ({
    date: addDays(today, -(noise.length - 1 - k)),
    kg: Math.round((73.2 - k * 0.09 + n) * 10) / 10,
  }));

  return {
    version: 1,
    profile: { ...DEFAULT_PROFILE, weightKg: weights[weights.length - 1].kg },
    days,
    weights,
    customFoods: [],
    recentFoodIds: ['whey', 'oats-milk', 'boiled-egg', 'roti', 'toor-dal', 'chicken-curry'],
  };
}
