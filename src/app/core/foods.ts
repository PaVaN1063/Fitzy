import { Diet, Food } from './models';

/**
 * Built-in foods with approximate values per serving (home-style portions, from common
 * Indian food composition references). Values are estimates; users can add their own foods.
 */
export const FOODS: Food[] = [
  // Breakfast
  { id: 'idli', name: 'Idli', serving: '1 piece (40 g)', category: 'breakfast', veg: true, kcal: 58, protein: 1.6, carbs: 12, fat: 0.2 },
  { id: 'plain-dosa', name: 'Plain dosa', serving: '1 medium', category: 'breakfast', veg: true, kcal: 133, protein: 2.7, carbs: 19, fat: 5 },
  { id: 'masala-dosa', name: 'Masala dosa', serving: '1 large', category: 'breakfast', veg: true, kcal: 350, protein: 7, carbs: 50, fat: 14 },
  { id: 'upma', name: 'Upma', serving: '1 katori (150 g)', category: 'breakfast', veg: true, kcal: 250, protein: 6, carbs: 36, fat: 9 },
  { id: 'poha', name: 'Poha', serving: '1 plate (150 g)', category: 'breakfast', veg: true, kcal: 250, protein: 5, carbs: 40, fat: 8 },
  { id: 'oats-milk', name: 'Oats with milk', serving: '40 g oats + 200 ml milk', category: 'breakfast', veg: true, kcal: 260, protein: 13, carbs: 35, fat: 7 },
  { id: 'aloo-paratha', name: 'Aloo paratha', serving: '1 piece', category: 'breakfast', veg: true, kcal: 290, protein: 6, carbs: 38, fat: 13 },
  { id: 'brown-bread', name: 'Brown bread', serving: '1 slice', category: 'breakfast', veg: true, kcal: 70, protein: 3, carbs: 12, fat: 1 },
  { id: 'omelette', egg: true, name: 'Omelette (2 eggs)', serving: '1 omelette', category: 'breakfast', veg: false, kcal: 190, protein: 13, carbs: 1.5, fat: 15 },

  // Grains
  { id: 'roti', name: 'Roti / chapati', serving: '1 medium (40 g)', category: 'grains', veg: true, kcal: 110, protein: 3.1, carbs: 18, fat: 3 },
  { id: 'white-rice', name: 'White rice (cooked)', serving: '1 katori (150 g)', category: 'grains', veg: true, kcal: 195, protein: 4, carbs: 43, fat: 0.4 },
  { id: 'brown-rice', name: 'Brown rice (cooked)', serving: '1 katori (150 g)', category: 'grains', veg: true, kcal: 165, protein: 3.8, carbs: 34, fat: 1.4 },
  { id: 'quinoa', name: 'Quinoa (cooked)', serving: '1 katori (150 g)', category: 'grains', veg: true, kcal: 180, protein: 6.6, carbs: 32, fat: 2.9 },
  { id: 'sweet-potato', name: 'Sweet potato (boiled)', serving: '150 g', category: 'grains', veg: true, kcal: 130, protein: 2.4, carbs: 30, fat: 0.2 },
  { id: 'chicken-biryani', name: 'Chicken biryani', serving: '1 plate (300 g)', category: 'grains', veg: false, kcal: 500, protein: 25, carbs: 60, fat: 17 },

  // Dal & curry
  { id: 'toor-dal', name: 'Toor dal', serving: '1 katori (150 g)', category: 'dal & curry', veg: true, kcal: 150, protein: 8, carbs: 20, fat: 4 },
  { id: 'rajma', name: 'Rajma', serving: '1 katori (150 g)', category: 'dal & curry', veg: true, kcal: 210, protein: 9, carbs: 27, fat: 7 },
  { id: 'chole', name: 'Chole', serving: '1 katori (150 g)', category: 'dal & curry', veg: true, kcal: 240, protein: 10, carbs: 32, fat: 8 },
  { id: 'sambar', name: 'Sambar', serving: '1 katori (150 g)', category: 'dal & curry', veg: true, kcal: 130, protein: 5, carbs: 18, fat: 4 },
  { id: 'palak-paneer', name: 'Palak paneer', serving: '1 katori (150 g)', category: 'dal & curry', veg: true, kcal: 280, protein: 13, carbs: 9, fat: 21 },
  { id: 'mixed-veg', name: 'Mixed veg sabzi', serving: '1 katori (150 g)', category: 'dal & curry', veg: true, kcal: 150, protein: 4, carbs: 14, fat: 9 },
  { id: 'chicken-curry', name: 'Chicken curry', serving: '1 katori (150 g)', category: 'dal & curry', veg: false, kcal: 260, protein: 26, carbs: 6, fat: 15 },
  { id: 'fish-curry', name: 'Fish curry', serving: '1 katori (150 g)', category: 'dal & curry', veg: false, kcal: 220, protein: 22, carbs: 5, fat: 12 },

  // Protein
  { id: 'chicken-breast', name: 'Chicken breast (grilled)', serving: '100 g', category: 'protein', veg: false, kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 'boiled-egg', egg: true, name: 'Boiled egg', serving: '1 large', category: 'protein', veg: false, kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { id: 'egg-white', egg: true, name: 'Egg white', serving: '1 egg', category: 'protein', veg: false, kcal: 17, protein: 3.6, carbs: 0.2, fat: 0.1 },
  { id: 'paneer', name: 'Paneer', serving: '100 g', category: 'protein', veg: true, kcal: 265, protein: 18, carbs: 3, fat: 20 },
  { id: 'soya-chunks', name: 'Soya chunks (dry)', serving: '50 g', category: 'protein', veg: true, kcal: 172, protein: 26, carbs: 16.5, fat: 0.3 },
  { id: 'tofu', name: 'Tofu (firm)', serving: '100 g', category: 'protein', veg: true, kcal: 120, protein: 13, carbs: 3, fat: 7 },
  { id: 'sprouts', name: 'Moong sprouts salad', serving: '1 katori (100 g)', category: 'protein', veg: true, kcal: 70, protein: 5, carbs: 11, fat: 0.5 },

  // Dairy
  { id: 'milk', name: 'Toned milk', serving: '1 glass (250 ml)', category: 'dairy', veg: true, kcal: 145, protein: 7.8, carbs: 11.5, fat: 7.5 },
  { id: 'curd', name: 'Curd / dahi', serving: '1 katori (150 g)', category: 'dairy', veg: true, kcal: 90, protein: 5, carbs: 7, fat: 4.5 },
  { id: 'greek-yogurt', name: 'Greek yogurt', serving: '100 g', category: 'dairy', veg: true, kcal: 90, protein: 9, carbs: 5, fat: 3.5 },
  { id: 'buttermilk', name: 'Buttermilk / chaas', serving: '1 glass (250 ml)', category: 'dairy', veg: true, kcal: 40, protein: 2, carbs: 4, fat: 1.5 },
  { id: 'ghee', name: 'Ghee', serving: '1 tsp (5 g)', category: 'dairy', veg: true, kcal: 45, protein: 0, carbs: 0, fat: 5 },

  // Fruit
  { id: 'banana', name: 'Banana', serving: '1 medium', category: 'fruit', veg: true, kcal: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: 'apple', name: 'Apple', serving: '1 medium', category: 'fruit', veg: true, kcal: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: 'papaya', name: 'Papaya', serving: '1 bowl (150 g)', category: 'fruit', veg: true, kcal: 65, protein: 0.7, carbs: 16, fat: 0.4 },

  // Snacks
  { id: 'peanut-butter', name: 'Peanut butter', serving: '1 tbsp (16 g)', category: 'snacks', veg: true, kcal: 94, protein: 4, carbs: 3.5, fat: 8 },
  { id: 'almonds', name: 'Almonds', serving: '10 nuts (12 g)', category: 'snacks', veg: true, kcal: 70, protein: 2.5, carbs: 2.5, fat: 6 },
  { id: 'roasted-chana', name: 'Roasted chana', serving: '30 g', category: 'snacks', veg: true, kcal: 110, protein: 6.5, carbs: 18, fat: 1.8 },
  { id: 'samosa', name: 'Samosa', serving: '1 piece', category: 'snacks', veg: true, kcal: 260, protein: 4, carbs: 30, fat: 14 },
  { id: 'chai', name: 'Chai with sugar', serving: '1 cup', category: 'snacks', veg: true, kcal: 100, protein: 2.5, carbs: 13, fat: 3.5 },
  { id: 'black-coffee', name: 'Black coffee', serving: '1 cup', category: 'snacks', veg: true, kcal: 2, protein: 0.3, carbs: 0, fat: 0 },

  // Supplements
  { id: 'whey', name: 'Whey protein', serving: '1 scoop (30 g)', category: 'supplements', veg: true, kcal: 120, protein: 24, carbs: 3, fat: 1.5 },
  { id: 'creatine', name: 'Creatine monohydrate', serving: '5 g', category: 'supplements', veg: true, kcal: 0, protein: 0, carbs: 0, fat: 0 },
];

/** Sample products returned by the demo scanner (not real lookups). */
export const DEMO_SCAN_PRODUCTS: Food[] = [
  { id: 'demo-whey-choc', name: 'Whey Protein, Double Chocolate', serving: '1 scoop (33 g)', category: 'supplements', veg: true, kcal: 130, protein: 25, carbs: 4, fat: 1.6 },
  { id: 'demo-oats', name: 'Rolled Oats', serving: '40 g', category: 'breakfast', veg: true, kcal: 150, protein: 5, carbs: 27, fat: 2.8 },
  { id: 'demo-pb', name: 'Crunchy Peanut Butter, Unsweetened', serving: '2 tbsp (32 g)', category: 'snacks', veg: true, kcal: 190, protein: 8.5, carbs: 6, fat: 15 },
  { id: 'demo-protein-bar', name: 'Protein Bar, Peanut Butter', serving: '1 bar (60 g)', category: 'snacks', veg: true, kcal: 240, protein: 20, carbs: 22, fat: 9 },
];

/** Whether a food fits a diet preference. */
export function fitsDiet(f: Food, diet: Diet): boolean {
  return diet === 'nonveg' || f.veg || (diet === 'egg' && !!f.egg);
}

export const FOOD_CATEGORIES = ['all', 'breakfast', 'grains', 'dal & curry', 'protein', 'dairy', 'fruit', 'snacks', 'supplements', 'custom'] as const;
