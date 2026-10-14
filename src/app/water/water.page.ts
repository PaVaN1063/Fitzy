import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { lastNDays, timeLabel, todayKey, weekday } from '../core/dates';
import { WaterEntry } from '../core/models';
import { waterGoalMl } from '../core/nutrition';
import { TrackerService } from '../core/tracker.service';

interface WaterBar {
  key: string;
  label: string;
  ml: number;
  goal: number;
  pct: number;
  met: boolean;
}

@Component({
  selector: 'app-water',
  templateUrl: './water.page.html',
  styleUrls: ['./water.page.scss'],
})
export class WaterPage implements OnInit, OnDestroy {
  readonly presets = [
    { ml: 250, label: 'Glass', icon: 'wine-outline' },
    { ml: 500, label: 'Bottle', icon: 'flask-outline' },
    { ml: 750, label: 'Shaker', icon: 'beaker-outline' },
    { ml: 1000, label: '1 litre', icon: 'water-outline' },
  ];

  date = todayKey();
  total = 0;
  goal = 0;
  weightKg = 0;
  gymDay = false;
  log: WaterEntry[] = [];
  week: WaterBar[] = [];
  daysMet = 0;
  custom: number | null = null;
  /** Demo only: reminders are not scheduled. */
  reminders = false;

  private sub?: Subscription;

  constructor(private tracker: TrackerService, private toast: ToastController) {}

  ngOnInit(): void {
    this.sub = this.tracker.changes$.subscribe(() => this.refresh());
  }

  ionViewWillEnter(): void {
    // The date may have rolled over since the page was first opened.
    if (this.date !== todayKey()) {
      this.date = todayKey();
      this.refresh();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get pct(): number {
    return this.goal ? Math.min(100, Math.round((this.total / this.goal) * 100)) : 0;
  }

  get left(): number {
    return Math.max(0, this.goal - this.total);
  }

  /** Height of the water in the glass drawing (viewBox units, glass interior spans y 22..182). */
  get fillY(): number {
    return 182 - (160 * this.pct) / 100;
  }

  add(ml: number): void {
    if (!ml || ml <= 0) { return; }
    const before = this.total;
    this.tracker.addWater(this.date, Math.round(ml));
    if (before < this.goal && before + ml >= this.goal) {
      this.say('Daily water goal reached 💧');
    }
  }

  addCustom(): void {
    const ml = Number(this.custom);
    if (ml > 0 && ml <= 3000) {
      this.add(ml);
      this.custom = null;
    } else {
      this.say('Enter an amount between 1 and 3000 ml');
    }
  }

  undo(): void {
    this.tracker.undoWater(this.date);
  }

  toggleReminders(on: boolean): void {
    this.reminders = on;
    if (on) {
      this.say('Demo: reminders are not active in this version');
    }
  }

  time(at: number): string {
    return timeLabel(at);
  }

  private refresh(): void {
    const day = this.tracker.day(this.date);
    this.weightKg = this.tracker.profile.weightKg;
    this.gymDay = day.gymDay;
    this.total = this.tracker.waterTotal(this.date);
    this.goal = waterGoalMl(this.weightKg, this.gymDay);
    this.log = [...day.water].reverse();

    this.week = lastNDays(this.date, 7).map(key => {
      const ml = this.tracker.waterTotal(key);
      const goal = waterGoalMl(this.weightKg, this.tracker.day(key).gymDay);
      return { key, label: weekday(key), ml, goal, pct: Math.min(100, (ml / goal) * 100), met: ml >= goal };
    });
    this.daysMet = this.week.filter(b => b.met).length;
  }

  private async say(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 1800, position: 'top' });
    await t.present();
  }
}
