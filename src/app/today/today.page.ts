import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { addDays, dayLabel, dayOfMonth, lastNDays, timeLabel, todayKey, weekday } from '../core/dates';
import { LogEntry, Macros, MEALS, MealType, Targets } from '../core/models';
import { entriesForMeal, sumMacros } from '../core/nutrition';
import { TrackerService } from '../core/tracker.service';
import { FoodSearchComponent } from '../shared/food-search.component';

interface MealView {
  id: MealType;
  label: string;
  icon: string;
  entries: LogEntry[];
  totals: Macros;
}

interface StripDay {
  key: string;
  weekday: string;
  day: number;
  logged: boolean;
}

@Component({
  selector: 'app-today',
  templateUrl: './today.page.html',
  styleUrls: ['./today.page.scss'],
})
export class TodayPage implements OnInit, OnDestroy {
  date = todayKey();
  strip: StripDay[] = [];
  meals: MealView[] = [];
  totals: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  target: Targets = { kcal: 0, protein: 0, carbs: 0, fat: 0, bmr: 0, tdee: 0, waterMl: 0 };
  gymDay = false;
  water = 0;
  canCopyYesterday = false;

  private sub?: Subscription;
  private routeSub?: Subscription;

  constructor(
    private tracker: TrackerService,
    private modal: ModalController,
    private toast: ToastController,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.sub = this.tracker.changes$.subscribe(() => this.refresh());
    this.routeSub = this.route.queryParamMap.subscribe(params => {
      const d = params.get('date');
      if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
        this.select(d);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  get isToday(): boolean {
    return this.date === todayKey();
  }

  get title(): string {
    return dayLabel(this.date);
  }

  get remaining(): number {
    return this.target.kcal - this.totals.kcal;
  }

  select(key: string): void {
    if (key > todayKey()) { return; }
    this.date = key;
    this.refresh();
  }

  shift(days: number): void {
    this.select(addDays(this.date, days));
  }

  toggleGym(on: boolean): void {
    this.tracker.setGymDay(this.date, on);
  }

  quickWater(): void {
    this.tracker.addWater(this.date, 250);
  }

  async addFood(meal: MealType): Promise<void> {
    const modal = await this.modal.create({
      component: FoodSearchComponent,
      componentProps: { date: this.date, meal },
      breakpoints: [0, 0.92, 1],
      initialBreakpoint: 0.92,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss<{ added: string }>();
    if (role === 'added' && data) {
      this.say(`${data.added} added`);
    }
  }

  remove(entry: LogEntry): void {
    this.tracker.removeEntry(this.date, entry.id);
    this.say(`${entry.name} removed`);
  }

  copyYesterday(): void {
    const n = this.tracker.copyDay(addDays(this.date, -1), this.date);
    this.say(`Copied ${n} food${n === 1 ? '' : 's'} from the day before`);
  }

  time(at: number): string {
    return timeLabel(at);
  }

  trackEntry(_: number, e: LogEntry): string {
    return e.id;
  }

  private refresh(): void {
    const today = todayKey();
    const day = this.tracker.day(this.date);

    this.totals = sumMacros(day.entries);
    this.target = this.tracker.targetsFor(this.date);
    this.gymDay = day.gymDay;
    this.water = this.tracker.waterTotal(this.date);
    this.canCopyYesterday = day.entries.length === 0 && this.tracker.day(addDays(this.date, -1)).entries.length > 0;

    this.meals = MEALS.map(m => {
      const entries = entriesForMeal(day.entries, m.id);
      return { ...m, entries, totals: sumMacros(entries) };
    });

    const end = addDays(this.date, 3) > today ? today : addDays(this.date, 3);
    this.strip = lastNDays(end, 7).map(key => ({
      key,
      weekday: weekday(key),
      day: dayOfMonth(key),
      logged: this.tracker.day(key).entries.length > 0,
    }));
  }

  private async say(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 1600, position: 'top' });
    await t.present();
  }
}
