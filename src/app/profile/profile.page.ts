import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { Activity, Goal, Profile, Targets } from '../core/models';
import {
  ACTIVITY_FACTORS, ACTIVITY_LABELS, DEFAULT_PROTEIN_PER_KG, GOAL_ADJUST, GOAL_LABELS,
  bmi, bmiLabel, round1, targets, waterGoalMl,
} from '../core/nutrition';
import { TrackerService } from '../core/tracker.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  readonly activities = (Object.keys(ACTIVITY_LABELS) as Activity[]).map(id => ({ id, label: ACTIVITY_LABELS[id], factor: ACTIVITY_FACTORS[id] }));
  readonly goals = (Object.keys(GOAL_LABELS) as Goal[]).map(id => ({ id, label: GOAL_LABELS[id] }));

  form: Profile;
  saved: Profile;

  private sub?: Subscription;

  constructor(private tracker: TrackerService, private alert: AlertController, private toast: ToastController) {
    this.saved = { ...tracker.profile };
    this.form = { ...tracker.profile };
  }

  ngOnInit(): void {
    this.sub = this.tracker.changes$.subscribe(() => {
      // Weight can change from the Progress tab; pick it up unless the user is mid-edit.
      if (!this.dirty) {
        this.saved = { ...this.tracker.profile };
        this.form = { ...this.tracker.profile };
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get valid(): boolean {
    const f = this.clean;
    return f.age >= 14 && f.age <= 90 && f.heightCm >= 120 && f.heightCm <= 230 && f.weightKg >= 30 && f.weightKg <= 250;
  }

  get dirty(): boolean {
    return JSON.stringify(this.clean) !== JSON.stringify(this.saved);
  }

  /** Form values with numeric fields coerced (inputs can hand back strings). */
  get clean(): Profile {
    return {
      ...this.form,
      name: (this.form.name || '').trim(),
      age: Number(this.form.age) || 0,
      heightCm: Number(this.form.heightCm) || 0,
      weightKg: Number(this.form.weightKg) || 0,
      proteinPerKg: round1(Number(this.form.proteinPerKg) || 0),
    };
  }

  get t(): Targets {
    return targets(this.clean);
  }

  get goalPct(): string {
    const pct = Math.round(GOAL_ADJUST[this.form.goal] * 100);
    return pct === 0 ? 'no change' : `${pct > 0 ? '+' : ''}${pct}%`;
  }

  get bmiValue(): number {
    return round1(bmi(this.clean.weightKg, this.clean.heightCm));
  }

  get bmiText(): string {
    return bmiLabel(this.bmiValue);
  }

  get waterRest(): number {
    return waterGoalMl(this.clean.weightKg, false);
  }

  get waterGym(): number {
    return waterGoalMl(this.clean.weightKg, true);
  }

  /** Share of calories from each macro, in %. */
  get split(): { protein: number; carbs: number; fat: number } {
    const t = this.t;
    const k = t.kcal || 1;
    return {
      protein: Math.round((t.protein * 4 * 100) / k),
      carbs: Math.round((t.carbs * 4 * 100) / k),
      fat: Math.round((t.fat * 9 * 100) / k),
    };
  }

  get initials(): string {
    const parts = ((this.form.name || '').trim() || '?').split(/\s+/);
    return (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '')).toUpperCase();
  }

  setGoal(goal: Goal): void {
    this.form = { ...this.form, goal, proteinPerKg: DEFAULT_PROTEIN_PER_KG[goal] };
  }

  async save(): Promise<void> {
    if (!this.valid) { return; }
    this.tracker.saveProfile(this.clean);
    this.saved = { ...this.tracker.profile };
    this.form = { ...this.tracker.profile };
    const t = await this.toast.create({ message: 'Targets saved', duration: 1500, position: 'top' });
    await t.present();
  }

  undo(): void {
    this.form = { ...this.saved };
  }

  async confirmReset(kind: 'demo' | 'clear'): Promise<void> {
    const a = await this.alert.create({
      header: kind === 'demo' ? 'Reload sample data?' : 'Delete all data?',
      message: kind === 'demo'
        ? 'Your meals, water and weigh-ins will be replaced with the sample data.'
        : 'Every meal, water entry, weigh-in and custom food on this phone will be deleted.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: kind === 'demo' ? 'Reload samples' : 'Delete everything',
          role: 'destructive',
          handler: () => (kind === 'demo' ? this.tracker.resetToDemo() : this.tracker.clearAll()),
        },
      ],
    });
    await a.present();
  }
}
