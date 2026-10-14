import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { AuthService } from '../core/auth.service';

const STEPS = ['Warming up', 'Loading your meals', 'Counting your water', 'Ready'];

/** Brand screen shown on launch, then on to the app or the login screen. */
@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage {
  readonly letters = 'efacm'.split('');
  status = STEPS[0];

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(private nav: NavController, private auth: AuthService) {}

  ionViewDidEnter(): void {
    STEPS.forEach((s, i) => this.timers.push(setTimeout(() => (this.status = s), i * 650)));
    this.timers.push(setTimeout(() => this.next(), 2600));
  }

  ionViewWillLeave(): void {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
  }

  next(): void {
    this.nav.navigateRoot(this.auth.loggedIn ? '/tabs/today' : '/login', { animated: true, animationDirection: 'forward' });
  }
}
