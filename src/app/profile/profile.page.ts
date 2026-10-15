import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthService, formatPhone } from '../core/auth.service';
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

  get phone(): string {
    return formatPhone(this.profile.phone);
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

  setNotify(key: 'meals' | 'water' | 'weekly', on: boolean): void {
    // TODO: schedule with @capacitor/local-notifications; for now only the preference is saved.
    this.tracker.updateSettings({ notify: { ...this.settings.notify, [key]: on } });
    const what = { meals: 'Meal reminders', water: 'Water reminders', weekly: 'Weekly report' }[key];
    this.say(`${what} ${on ? 'on' : 'off'}`);
  }

  /** Copies everything stored on the phone, as JSON, to the clipboard. */
  async exportData(): Promise<void> {
    const json = this.tracker.exportJson();
    const kb = Math.max(1, Math.round(json.length / 1024));
    try {
      await navigator.clipboard.writeText(json);
      this.say(`Your data (${kb} KB) is copied. Paste it into a note or email to keep a backup.`);
    } catch {
      this.say('Could not copy your data. Please try again.');
    }
  }

  async confirm(kind: 'clear' | 'logout'): Promise<void> {
    const copy = {
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
  }

  private async say(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, position: 'top' });
    await t.present();
  }
}
