import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { todayKey } from '../core/dates';
import { DEMO_SCAN_PRODUCTS } from '../core/foods';
import { Food, MealType } from '../core/models';
import { FoodSearchComponent } from '../shared/food-search.component';

type Mode = 'photo' | 'barcode';
type Phase = 'ready' | 'scanning' | 'result';

/**
 * DEMO ONLY. No camera is opened and nothing is looked up:
 * "capturing" waits briefly and then shows one of the sample products.
 */
@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit, OnDestroy {
  mode: Mode = 'photo';
  phase: Phase = 'ready';
  result: Food | null = null;

  private date = todayKey();
  private meal: MealType = mealForNow();
  private next = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private routeSub?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, private modal: ModalController) {}

  ngOnInit(): void {
    this.routeSub = this.route.queryParamMap.subscribe(p => {
      const meal = p.get('meal');
      const date = p.get('date');
      if (meal === 'breakfast' || meal === 'lunch' || meal === 'snacks' || meal === 'dinner') { this.meal = meal; }
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) { this.date = date; }
    });
  }

  ionViewWillLeave(): void {
    this.reset();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    if (this.timer) { clearTimeout(this.timer); }
  }

  get hint(): string {
    return this.mode === 'photo'
      ? 'Fit the front of the pack or its nutrition label inside the frame'
      : 'Line up the barcode inside the frame';
  }

  setMode(m: Mode): void {
    this.mode = m;
    this.reset();
  }

  capture(): void {
    if (this.phase === 'scanning') { return; }
    this.phase = 'scanning';
    this.timer = setTimeout(() => {
      this.result = DEMO_SCAN_PRODUCTS[this.next % DEMO_SCAN_PRODUCTS.length];
      this.next++;
      this.phase = 'result';
    }, 1400);
  }

  reset(): void {
    if (this.timer) { clearTimeout(this.timer); }
    this.phase = 'ready';
    this.result = null;
  }

  async addResult(): Promise<void> {
    if (!this.result) { return; }
    const modal = await this.modal.create({
      component: FoodSearchComponent,
      componentProps: { date: this.date, meal: this.meal, preset: this.result },
      breakpoints: [0, 0.92, 1],
      initialBreakpoint: 0.92,
    });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'added') {
      this.reset();
      this.router.navigate(['/tabs/today'], { queryParams: { date: this.date } });
    }
  }
}

function mealForNow(): MealType {
  const h = new Date().getHours();
  if (h < 11) { return 'breakfast'; }
  if (h < 16) { return 'lunch'; }
  if (h < 19) { return 'snacks'; }
  return 'dinner';
}
