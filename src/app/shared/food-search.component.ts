import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { FOOD_CATEGORIES } from '../core/foods';
import { Food, Macros, MEALS, MealType } from '../core/models';
import { kcalFromMacros, scaleMacros } from '../core/nutrition';
import { TrackerService } from '../core/tracker.service';

type Step = 'list' | 'qty' | 'custom';

/** Bottom sheet for adding a food to a meal: search, pick a quantity, or create a custom food. */
@Component({
  selector: 'app-food-search',
  templateUrl: './food-search.component.html',
  styleUrls: ['./food-search.component.scss'],
})
export class FoodSearchComponent implements OnInit {
  /** Set through componentProps when the modal opens. */
  @Input() date = '';
  @Input() meal: MealType = 'breakfast';
  /** Optional food to jump straight to the quantity step (used by the scanner). */
  @Input() preset: Food | null = null;

  readonly meals = MEALS;
  readonly categories = FOOD_CATEGORIES;
  readonly quickQty = [0.5, 1, 1.5, 2, 3];

  step: Step = 'list';
  query = '';
  category: string = 'all';
  results: Food[] = [];
  recent: Food[] = [];

  selected: Food | null = null;
  qty = 1;

  custom = { name: '', serving: '1 serving', kcal: 0, protein: 0, carbs: 0, fat: 0, veg: true };

  constructor(
    private tracker: TrackerService,
    private modal: ModalController,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.recent = this.tracker.recentFoods();
    this.filter();
    if (this.preset) {
      this.pick(this.preset);
    }
  }

  get mealLabel(): string {
    return this.meals.find(m => m.id === this.meal)?.label ?? '';
  }

  get preview(): Macros | null {
    return this.selected ? scaleMacros(this.selected, this.qty) : null;
  }

  get showRecent(): boolean {
    return !this.query.trim() && this.category === 'all' && this.recent.length > 0;
  }

  get customKcalHint(): number {
    return kcalFromMacros(this.custom);
  }

  get customValid(): boolean {
    return this.custom.name.trim().length > 0 && Number(this.custom.kcal) >= 0;
  }

  filter(): void {
    const q = this.query.trim().toLowerCase();
    this.results = this.tracker.allFoods().filter(f =>
      (this.category === 'all' || f.category === this.category) &&
      (!q || f.name.toLowerCase().includes(q) || f.category.includes(q)),
    );
  }

  setCategory(c: string): void {
    this.category = c;
    this.filter();
  }

  pick(food: Food): void {
    this.selected = food;
    this.qty = 1;
    this.step = 'qty';
  }

  changeQty(delta: number): void {
    this.qty = Math.max(0.5, Math.round((this.qty + delta) * 2) / 2);
  }

  add(): void {
    if (!this.selected) { return; }
    this.tracker.addFood(this.date, this.meal, this.selected, this.qty);
    this.modal.dismiss({ added: this.selected.name }, 'added');
  }

  openCustom(): void {
    this.custom = { name: this.query.trim(), serving: '1 serving', kcal: 0, protein: 0, carbs: 0, fat: 0, veg: true };
    this.step = 'custom';
  }

  useMacroKcal(): void {
    this.custom.kcal = this.customKcalHint;
  }

  saveCustom(): void {
    if (!this.customValid) { return; }
    const food = this.tracker.addCustomFood({
      name: this.custom.name.trim(),
      serving: this.custom.serving.trim() || '1 serving',
      veg: this.custom.veg,
      kcal: Number(this.custom.kcal) || 0,
      protein: Number(this.custom.protein) || 0,
      carbs: Number(this.custom.carbs) || 0,
      fat: Number(this.custom.fat) || 0,
    });
    this.filter();
    this.pick(food);
  }

  back(): void {
    this.step = 'list';
    this.selected = null;
  }

  async openScanner(): Promise<void> {
    await this.modal.dismiss(null, 'scan');
    this.router.navigate(['/tabs/scan'], { queryParams: { meal: this.meal, date: this.date } });
  }

  close(): void {
    this.modal.dismiss(null, 'cancel');
  }

  trackFood(_: number, f: Food): string {
    return f.id;
  }
}
