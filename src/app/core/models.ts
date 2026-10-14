export type Sex = 'male' | 'female';
export type Goal = 'cut' | 'maintain' | 'bulk';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export const MEALS: { id: MealType; label: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: 'cafe-outline' },
  { id: 'lunch', label: 'Lunch', icon: 'restaurant-outline' },
  { id: 'snacks', label: 'Snacks', icon: 'nutrition-outline' },
  { id: 'dinner', label: 'Dinner', icon: 'moon-outline' },
];

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
  /** grams of protein per kg of body weight */
  proteinPerKg: number;
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
