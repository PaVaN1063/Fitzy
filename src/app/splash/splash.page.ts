import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

import { AuthService } from '../core/auth.service';

/** Brand screen shown on launch, then on to the app or the login screen. */
@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage {
  private timer?: ReturnType<typeof setTimeout>;

  constructor(private nav: NavController, private auth: AuthService) {}

  ionViewDidEnter(): void {
    this.timer = setTimeout(() => this.next(), 1800);
  }

  ionViewWillLeave(): void {
    if (this.timer) { clearTimeout(this.timer); }
  }

  next(): void {
    this.nav.navigateRoot(this.auth.loggedIn ? '/tabs/today' : '/login', { animated: true, animationDirection: 'forward' });
  }
}
