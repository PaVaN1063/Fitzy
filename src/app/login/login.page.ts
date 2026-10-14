import { Component } from '@angular/core';
import { ModalController, NavController, ToastController } from '@ionic/angular';

import { AuthService, DEMO_PHONE, VerifyResult, digitsOnly, formatPhone } from '../core/auth.service';
import { Sex } from '../core/models';
import { targets } from '../core/nutrition';
import { TrackerService } from '../core/tracker.service';
import { OtpSheetComponent } from './otp-sheet.component';

type Step = 'phone' | 'details';

/** Phone + OTP login (demo), then name and body details for new accounts. */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  readonly genders: { id: Sex; label: string; icon: string }[] = [
    { id: 'male', label: 'Male', icon: 'male' },
    { id: 'female', label: 'Female', icon: 'female' },
    { id: 'other', label: 'Other', icon: 'male-female' },
  ];
  readonly demoPhone = formatPhone(DEMO_PHONE);

  step: Step = 'phone';
  phone = '';
  sending = false;

  details = { name: '', sex: 'male' as Sex, age: null as number | null, weightKg: null as number | null, heightCm: null as number | null };
  nameError = '';
  bodyError = '';

  constructor(
    private auth: AuthService,
    private tracker: TrackerService,
    private modal: ModalController,
    private nav: NavController,
    private toast: ToastController,
  ) {}

  get digits(): string {
    return digitsOnly(this.phone);
  }

  get phoneReady(): boolean {
    return this.digits.length === 10;
  }

  get prettyPhone(): string {
    return formatPhone(this.digits);
  }

  /** Keeps only digits (pasting "+91 98765-43210" works) and at most 10 of them. */
  onPhone(el: HTMLInputElement): void {
    let d = digitsOnly(el.value);
    if (d.length > 10 && d.startsWith('91')) { d = d.slice(2); }
    this.phone = d.slice(0, 10);
    if (el.value !== this.phone) { el.value = this.phone; }
  }

  useDemoNumber(): void {
    this.phone = DEMO_PHONE;
  }

  async sendCode(): Promise<void> {
    if (!this.phoneReady || this.sending) { return; }
    this.sending = true;
    this.auth.requestOtp(this.digits);
    const sheet = await this.modal.create({
      component: OtpSheetComponent,
      componentProps: { phone: this.digits },
      breakpoints: [0, 0.68],
      initialBreakpoint: 0.68,
      handle: true,
      cssClass: 'otp-drawer',
    });
    await sheet.present();
    this.sending = false;
    const { data, role } = await sheet.onWillDismiss<VerifyResult>();
    if (role !== 'verified') { return; }
    if (data === 'existing') {
      this.nav.navigateRoot('/tabs/today');
      this.say(`Welcome back, ${this.tracker.profile.name.split(' ')[0]}`);
    } else {
      this.step = 'details';
    }
  }

  setSex(s: Sex): void {
    this.details.sex = s;
  }

  back(): void {
    this.step = 'phone';
  }

  /** Continue saves everything entered; Skip keeps only the name and uses typical defaults. */
  finish(skipBody: boolean): void {
    const name = this.details.name.trim();
    this.nameError = name.length < 2 ? 'Please enter your name' : '';
    if (this.nameError) { return; }

    const num = (v: number | null, fallback: number) => (v === null || v === undefined || (v as unknown) === '' ? fallback : Number(v));
    const sex = this.details.sex;
    const body = skipBody
      ? { age: 25, weightKg: sex === 'female' ? 58 : 70, heightCm: sex === 'female' ? 160 : 172 }
      : {
          age: num(this.details.age, 25),
          weightKg: num(this.details.weightKg, sex === 'female' ? 58 : 70),
          heightCm: num(this.details.heightCm, sex === 'female' ? 160 : 172),
        };
    if (!skipBody) {
      const ok = body.age >= 14 && body.age <= 90 && body.weightKg >= 30 && body.weightKg <= 250 && body.heightCm >= 120 && body.heightCm <= 230;
      this.bodyError = ok ? '' : 'Check age (14–90), weight (30–250 kg) and height (120–230 cm)';
      if (!ok) { return; }
    }

    this.auth.completeSignUp({ name, sex, ...body });
    const kcal = targets(this.tracker.profile).kcal.toLocaleString('en-IN');
    this.nav.navigateRoot('/tabs/today');
    this.say(skipBody
      ? `Welcome, ${name.split(' ')[0]}! Add your body details later in Profile › Body & goals.`
      : `Welcome, ${name.split(' ')[0]}! Your daily target is ${kcal} kcal.`);
  }

  private async say(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2600, position: 'top' });
    await t.present();
  }
}
