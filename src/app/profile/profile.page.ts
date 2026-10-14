import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthService } from '../core/auth.service';
import { fromKey } from '../core/dates';
import { Diet, DIET_LABELS, Profile, Settings, Theme } from '../core/models';
import { GOAL_LABELS, targets } from '../core/nutrition';
import { ThemeService } from '../core/theme.service';
import { ProfileStats, TrackerService } from '../core/tracker.service';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Account hub: who you are, quick stats, and every setting. */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {
  readonly version = '1.0.0';

  profile!: Profile;
  settings!: Settings;
  stats!: ProfileStats;
  kcal = 0;
  protein = 0;
  provider: 'email' | 'google' = 'email';

  private sub?: Subscription;

  constructor(
    private tracker: TrackerService,
    private auth: AuthService,
    private theme: ThemeService,
    private nav: NavController,
    private alert: AlertController,
    private sheet: ActionSheetController,
    private toast: ToastController,
  ) {}

  ngOnInit(): void {
    this.sub = this.tracker.changes$.subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get initials(): string {
    const parts = (this.profile.name.trim() || '?').split(/\s+/);
    return (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '')).toUpperCase();
  }

  get memberSince(): string {
    const d = fromKey(this.profile.memberSince);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }

  get dietLabel(): string {
    return DIET_LABELS[this.profile.diet];
  }

  get goalLabel(): string {
    return GOAL_LABELS[this.profile.goal];
  }

  get themeLabel(): string {
    return { system: 'Match phone', light: 'Light', dark: 'Dark' }[this.settings.theme];
  }

  async chooseDiet(): Promise<void> {
    const options: Diet[] = ['veg', 'egg', 'nonveg'];
    const s = await this.sheet.create({
      header: 'Diet preference',
      subHeader: 'Food search only shows foods that fit',
      buttons: [
        ...options.map(d => ({
          text: DIET_LABELS[d] + (d === this.profile.diet ? '  ✓' : ''),
          handler: () => { this.tracker.updateProfile({ diet: d }); },
        })),
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await s.present();
  }

  async chooseTheme(): Promise<void> {
    const options: { id: Theme; label: string }[] = [
      { id: 'system', label: 'Match phone' },
      { id: 'light', label: 'Light' },
      { id: 'dark', label: 'Dark' },
    ];
    const s = await this.sheet.create({
      header: 'Theme',
      buttons: [
        ...options.map(o => ({
          text: o.label + (o.id === this.settings.theme ? '  ✓' : ''),
          handler: () => {
            this.tracker.updateSettings({ theme: o.id });
            this.theme.apply(o.id);
          },
        })),
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await s.present();
  }

  setUnits(imperial: boolean): void {
    this.tracker.updateSettings({ units: imperial ? 'imperial' : 'metric' });
    if (imperial) {
      this.say('Demo: the app still shows kg and cm in this version');
    }
  }

  setNotify(key: 'meals' | 'water' | 'weekly', on: boolean): void {
    this.tracker.updateSettings({ notify: { ...this.settings.notify, [key]: on } });
    if (on) {
      this.say('Demo: reminders are not scheduled in this version');
    }
  }

  async exportData(): Promise<void> {
    const kb = Math.max(1, Math.round(this.tracker.exportJson().length / 1024));
    this.say(`Demo: your data (${kb} KB) would be saved as a file here`);
  }

  async confirm(kind: 'demo' | 'clear' | 'logout'): Promise<void> {
    const copy = {
      demo: { header: 'Reload sample data?', message: 'Your meals, water and weigh-ins will be replaced with the sample data for Rahul.', ok: 'Reload samples' },
      clear: { header: 'Delete all logs?', message: 'Every meal, water entry, weigh-in and custom food on this phone will be deleted. Your account details stay.', ok: 'Delete everything' },
      logout: { header: 'Log out?', message: 'Your data stays on this phone. Log back in any time.', ok: 'Log out' },
    }[kind];
    const a = await this.alert.create({
      header: copy.header,
      message: copy.message,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: copy.ok,
          role: kind === 'logout' ? 'confirm' : 'destructive',
          handler: () => {
            if (kind === 'demo') { this.tracker.resetToDemo(); this.say('Sample data reloaded'); }
            if (kind === 'clear') { this.tracker.clearAll(); this.say('All logs deleted'); }
            if (kind === 'logout') { this.auth.logOut(); this.nav.navigateRoot('/login', { animationDirection: 'back' }); }
          },
        },
      ],
    });
    await a.present();
  }

  private refresh(): void {
    this.profile = this.tracker.profile;
    this.settings = this.tracker.settings;
    this.stats = this.tracker.stats();
    const t = targets(this.profile);
    this.kcal = t.kcal;
    this.protein = t.protein;
    this.provider = this.auth.session?.provider ?? 'email';
  }

  private async say(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, position: 'top' });
    await t.present();
  }
}
