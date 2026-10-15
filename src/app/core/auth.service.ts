import { Injectable } from '@angular/core';

import { Profile } from './models';
import { TrackerService } from './tracker.service';

export interface Session {
  /** 10-digit mobile number */
  phone: string;
  /** epoch ms */
  since: number;
}

export type VerifyResult = 'existing' | 'new' | 'wrong-code';

const SESSION_KEY = 'efacm.session.v3';
export const OTP_LENGTH = 4;

/**
 * Phone sign-in. There is no SMS backend yet, so any 4-digit code is accepted.
 * A number that already has an account on this phone signs straight in; a new number
 * goes on to the profile details step.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private pendingPhone = '';
  private verifiedPhone = '';

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

  requestOtp(phone: string): void {
    this.pendingPhone = digitsOnly(phone);
    this.verifiedPhone = '';
  }

  verifyOtp(code: string): VerifyResult {
    // TODO: verify the code with an SMS provider once a backend exists.
    if (!/^\d+$/.test(code) || code.length !== OTP_LENGTH || !this.pendingPhone) { return 'wrong-code'; }
    const phone = this.pendingPhone;
    const p = this.tracker.profile;
    if (p.phone === phone && p.name) {
      this.start(phone);
      return 'existing';
    }
    this.verifiedPhone = phone;
    return 'new';
  }

  /** Finishes sign-up for a verified new number. */
  completeSignUp(details: Pick<Profile, 'name' | 'sex' | 'age' | 'heightCm' | 'weightKg'>): void {
    const phone = this.verifiedPhone;
    if (!phone) { return; }
    this.tracker.startFreshAccount({ ...details, phone });
    this.start(phone);
  }

  logOut(): void {
    this.pendingPhone = '';
    this.verifiedPhone = '';
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // nothing to clear
    }
  }

  private start(phone: string): void {
    this.pendingPhone = '';
    this.verifiedPhone = '';
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ phone, since: Date.now() } as Session));
    } catch {
      // Storage unavailable: the user will need to sign in again next launch.
    }
  }
}

export function digitsOnly(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/** "9876543210" → "+91 98765 43210" */
export function formatPhone(phone: string): string {
  const d = digitsOnly(phone);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : d ? `+91 ${d}` : '';
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
