import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';

import { AuthService, DEMO_LOGIN } from '../core/auth.service';

type Mode = 'login' | 'signup';

/** DEMO login: accounts live only on this phone. */
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  mode: Mode = 'login';
  name = '';
  email = '';
  password = '';
  showPassword = false;
  error = '';
  busy = false;

  readonly demo = DEMO_LOGIN;

  constructor(private auth: AuthService, private nav: NavController, private toast: ToastController) {}

  setMode(m: Mode): void {
    this.mode = m;
    this.error = '';
  }

  useDemo(): void {
    this.mode = 'login';
    this.email = DEMO_LOGIN.email;
    this.password = DEMO_LOGIN.password;
    this.error = '';
  }

  submit(): void {
    if (this.busy) { return; }
    const err = this.mode === 'login'
      ? this.auth.logIn(this.email, this.password)
      : this.auth.signUp(this.name, this.email, this.password);
    if (err) {
      this.error = err;
      return;
    }
    this.busy = true;
    // A short pause so the button state is visible, like a real sign-in.
    setTimeout(() => {
      this.busy = false;
      if (this.mode === 'signup') {
        this.nav.navigateRoot('/tabs/profile/targets');
        this.say('Account created. Add your height and weight to set your targets.');
      } else {
        this.nav.navigateRoot('/tabs/today');
      }
    }, 600);
  }

  google(): void {
    this.auth.logInWithGoogle();
    this.nav.navigateRoot('/tabs/today');
    this.say('Demo: signed in to the sample account (Google was not contacted)');
  }

  forgot(): void {
    this.say('Demo: no reset email is sent. Use the sample account below.');
  }

  private async say(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2400, position: 'top' });
    await t.present();
  }
}
