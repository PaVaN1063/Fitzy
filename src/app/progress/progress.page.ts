import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { lastNDays, shortDate, todayKey } from '../core/dates';
import { round1, sumMacros, targets, waterGoalMl, weightTrend } from '../core/nutrition';
import { TrackerService } from '../core/tracker.service';

interface ChartPoint { x: number; y: number; }
interface Tick { y: number; label: string; }

/** Chart drawing area (SVG viewBox units). */
const W = 320, H = 170, PAD_L = 34, PAD_R = 10, PAD_T = 10, PAD_B = 22;

@Component({
  selector: 'app-progress',
  templateUrl: './progress.page.html',
  styleUrls: ['./progress.page.scss'],
})
export class ProgressPage implements OnInit, OnDestroy {
  readonly W = W;
  readonly H = H;
  readonly PAD_L = PAD_L;
  readonly PAD_R = PAD_R;

  newWeight: number | null = null;

  latest: number | null = null;
  avg7: number | null = null;
  change: number | null = null;

  dots: ChartPoint[] = [];
  trendPath = '';
  yTicks: Tick[] = [];
  xLabels: { x: number; label: string }[] = [];

  history: { date: string; label: string; kg: number }[] = [];

  week = { avgKcal: 0, targetKcal: 0, avgProtein: 0, targetProtein: 0, proteinDays: 0, loggedDays: 0, gymDays: 0, waterDays: 0 };
  notes: string[] = [];

  private sub?: Subscription;

  constructor(private tracker: TrackerService, private toast: ToastController) {}

  ngOnInit(): void {
    this.sub = this.tracker.changes$.subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  save(): void {
    const kg = Number(this.newWeight);
    if (!(kg >= 25 && kg <= 300)) {
      this.say('Enter a weight between 25 and 300 kg');
      return;
    }
    this.tracker.logWeight(todayKey(), round1(kg));
    this.newWeight = null;
    this.say(`Saved ${round1(kg)} kg for today`);
  }

  remove(date: string): void {
    this.tracker.removeWeight(date);
  }

  demoPhoto(): void {
    this.say('Demo: progress photos are not saved in this version');
  }

  private refresh(): void {
    const weights = this.tracker.weights;
    const trend = weightTrend(weights);
    const recent = trend.slice(-14);

    this.latest = weights.length ? weights[weights.length - 1].kg : null;
    this.avg7 = trend.length ? trend[trend.length - 1].avg : null;
    this.change = recent.length > 1 ? round1(recent[recent.length - 1].avg - recent[0].avg) : null;
    this.history = [...weights].reverse().slice(0, 30).map(w => ({ ...w, label: shortDate(w.date) }));

    this.buildChart(recent);
    this.buildWeek();
  }

  private buildChart(points: { date: string; kg: number; avg: number }[]): void {
    if (points.length < 2) {
      this.dots = [];
      this.trendPath = '';
      this.yTicks = [];
      this.xLabels = [];
      return;
    }
    const values = points.reduce<number[]>((acc, p) => acc.concat([p.kg, p.avg]), []);
    const lo = Math.floor(Math.min(...values) * 2) / 2 - 0.5;
    const hi = Math.ceil(Math.max(...values) * 2) / 2 + 0.5;
    const x = (i: number) => PAD_L + (i * (W - PAD_L - PAD_R)) / (points.length - 1);
    const y = (kg: number) => PAD_T + ((hi - kg) * (H - PAD_T - PAD_B)) / (hi - lo);

    this.dots = points.map((p, i) => ({ x: x(i), y: y(p.kg) }));
    this.trendPath = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.avg).toFixed(1)}`).join(' ');

    const step = hi - lo > 4 ? 1 : 0.5;
    this.yTicks = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) {
      this.yTicks.push({ y: y(v), label: v.toFixed(step < 1 ? 1 : 0) });
    }
    // Count back from the newest point so the latest date is always labelled and labels never crowd.
    const every = Math.ceil(points.length / 5);
    const last = points.length - 1;
    this.xLabels = points
      .map((p, i) => ({ x: x(i), label: shortDate(p.date), i }))
      .filter(l => (last - l.i) % every === 0)
      .map(({ x: lx, label }) => ({ x: lx, label }));
  }

  private buildWeek(): void {
    const today = todayKey();
    const profile = this.tracker.profile;
    const keys = lastNDays(today, 7);
    const days = keys.map(k => this.tracker.day(k));
    const logged = days.filter(d => d.entries.length > 0);
    const t = targets(profile);

    let proteinDays = 0, kcalSum = 0, proteinSum = 0;
    logged.forEach(d => {
      const m = sumMacros(d.entries);
      kcalSum += m.kcal;
      proteinSum += m.protein;
      if (m.protein >= t.protein * 0.9) { proteinDays++; }
    });

    this.week = {
      avgKcal: logged.length ? Math.round(kcalSum / logged.length) : 0,
      targetKcal: t.kcal,
      avgProtein: logged.length ? Math.round(proteinSum / logged.length) : 0,
      targetProtein: t.protein,
      proteinDays,
      loggedDays: logged.length,
      gymDays: days.filter(d => d.gymDay).length,
      waterDays: days.filter(d => this.tracker.waterTotal(d.date) >= waterGoalMl(profile.weightKg, d.gymDay)).length,
    };
    this.notes = this.coachNotes();
  }

  /** Simple rule-based tips from this week's numbers. */
  private coachNotes(): string[] {
    const w = this.week;
    const goal = this.tracker.profile.goal;
    const notes: string[] = [];
    if (w.loggedDays < 5) {
      notes.push(`You logged food on ${w.loggedDays} of the last 7 days. Logging most days makes the averages trustworthy.`);
    }
    if (w.loggedDays && w.proteinDays < 5) {
      const gap = Math.max(0, w.targetProtein - w.avgProtein);
      notes.push(`Protein target hit on ${w.proteinDays} days. You're about ${gap} g short on average; one scoop of whey or 150 g of chicken covers most of that.`);
    }
    if (this.change !== null && w.loggedDays >= 3) {
      if (goal === 'cut' && this.change >= 0) {
        notes.push('Your 7-day average weight isn’t dropping yet. Try trimming about 150 kcal a day for the next two weeks.');
      } else if (goal === 'bulk' && this.change <= 0) {
        notes.push('Your average weight isn’t going up. Add roughly 150–200 kcal a day, mostly from carbs around training.');
      } else if (goal === 'maintain' && Math.abs(this.change) > 1) {
        notes.push(`Your average weight moved ${this.change > 0 ? 'up' : 'down'} ${Math.abs(this.change)} kg in two weeks. Adjust calories slightly if that wasn't planned.`);
      }
    }
    if (w.waterDays < 4) {
      notes.push(`Water goal met on ${w.waterDays} of 7 days. Keeping a bottle at your desk helps.`);
    }
    if (!notes.length) {
      notes.push('Solid week: protein, water and logging are all on track. Keep it going.');
    }
    return notes;
  }

  private async say(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 1800, position: 'top' });
    await t.present();
  }
}
