export type Sex = 'male' | 'female' | 'other';
export type Goal = 'cut' | 'maintain' | 'bulk';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';
/** veg = vegetarian, egg = vegetarian plus eggs, nonveg = everything */
export type Diet = 'veg' | 'egg' | 'nonveg';
export type Theme = 'system' | 'light' | 'dark';
export type Units = 'metric' | 'imperial';

export const MEALS: { id: MealType; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: 'cafe-outline' },
  { id: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
  { id: 'snacks', label: 'Snacks', icon: 'nutrition-outline' },
  { id: 'dinner', label: 'Dinner', icon: 'moon-outline' },
];

export interface Profile {
  name: string;
  /** 10-digit mobile number without the country code; the login identity */
  phone: string;
  /** optional */
  email: string;
  city: string;
  diet: Diet;
  /** YYYY-MM-DD the account was created */
  memberSince: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
  /** grams of protein per kg of body weight */
  proteinPerKg: number;
  /** small JPEG data URL chosen by the user */
  photo?: string;
}

export type PhotoSlot = 'front' | 'side' | 'back';

export interface ProgressPhoto {
  dataUrl: string;
  /** YYYY-MM-DD */
  date: string;
}

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type FoodCategory = 'breakfast' | 'grains' | 'dal & curry' | 'protein' | 'dairy' | 'fruit' | 'snacks' | 'supplements' | 'custom';

export interface Food extends Macros {
  id: string;
  name: string;
  /** what one serving means, e.g. "1 medium (40 g)" */
  serving: string;
  category: FoodCategory;
  veg: boolean;
  /** contains egg (allowed for eggetarians) */
  egg?: boolean;
}

export interface LogEntry extends Macros {
  id: string;
  foodId: string;
  name: string;
  serving: string;
  meal: MealType;
  /** number of servings */
  qty: number;
  /** epoch ms */
  at: number;
}

export interface WaterEntry {
  ml: number;
  at: number;
}

export interface DayLog {
  /** YYYY-MM-DD */
  date: string;
  entries: LogEntry[];
  water: WaterEntry[];
  gymDay: boolean;
}

export interface WeightEntry {
  date: string;
  kg: number;
}

export interface Targets extends Macros {
  bmr: number;
  tdee: number;
  waterMl: number;
}

export interface Settings {
  theme: Theme;
  /** reserved; the app currently uses kg and cm */
  units: Units;
  /** reminder preferences */
  notify: { meals: boolean; water: boolean; weekly: boolean };
}

export const DIET_LABELS: Record<Diet, string> = {
  veg: 'Vegetarian',
  egg: 'Eggetarian',
  nonveg: 'Non-vegetarian',
};
