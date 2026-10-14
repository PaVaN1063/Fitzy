import { Injectable } from '@angular/core';

import { TrackerService } from './tracker.service';

export interface Session {
  email: string;
  provider: 'email' | 'google';
  /** epoch ms */
  since: number;
}

const SESSION_KEY = 'efacm.session';

/** The demo account's sign-in details, shown on the login screen. */
export const DEMO_LOGIN = { email: 'rahul.varma@example.com', password: 'efacm123' };

/**
 * DEMO sign-in. Nothing is sent anywhere: any well-formed email with a password of
 * 6+ characters is accepted, and the session is just a flag on this phone.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private tracker: TrackerService) {}

  get session(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }

  get loggedIn(): boolean {
    return this.session !== null;
  }

  /** Returns an error message, or null when signed in. */
  logIn(email: string, password: string): string | null {
    const problem = checkCredentials(email, password);
    if (problem) { return problem; }
    const clean = email.trim().toLowerCase();
    if (clean !== this.tracker.profile.email.toLowerCase()) {
      this.tracker.updateProfile({ email: clean });
    }
    this.save({ email: clean, provider: 'email', since: Date.now() });
    return null;
  }

  /** Creates a new, empty account on this phone. Returns an error message, or null. */
  signUp(name: string, email: string, password: string): string | null {
    if (name.trim().length < 2) { return 'Enter your name'; }
    const problem = checkCredentials(email, password);
    if (problem) { return problem; }
    const clean = email.trim().toLowerCase();
    this.tracker.startFreshAccount(name.trim(), clean);
    this.save({ email: clean, provider: 'email', since: Date.now() });
    return null;
  }

  /** Demo: signs in to the sample account without opening Google. */
  logInWithGoogle(): void {
    this.save({ email: this.tracker.profile.email, provider: 'google', since: Date.now() });
  }

  logOut(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // nothing to clear
    }
  }

  private save(s: Session): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch {
      // Storage unavailable: the user will need to sign in again next launch.
    }
  }
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function checkCredentials(email: string, password: string): string | null {
  if (!isEmail(email)) { return 'Enter a valid email address'; }
  if (password.length < 6) { return 'Password must be at least 6 characters'; }
  return null;
}
