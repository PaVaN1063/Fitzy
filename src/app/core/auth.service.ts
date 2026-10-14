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

const SESSION_KEY = 'efacm.session.v2';

/** The sample account's number and the demo verification code. */
export const DEMO_PHONE = '9876543210';
export const DEMO_OTP = '1234';
export const OTP_LENGTH = 4;

/**
 * DEMO phone login. No SMS is sent: the code is always DEMO_OTP.
 * The sample number opens Rahul's account; any other number creates a new account.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Number waiting for, or past, OTP verification. */
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

  /** The number that passed OTP and still needs profile details (sign-up). */
  get phoneAwaitingDetails(): string {
    return this.verifiedPhone;
  }

  /** Demo: pretends to text a code to the number. */
  requestOtp(phone: string): void {
    this.pendingPhone = digitsOnly(phone);
    this.verifiedPhone = '';
  }

  verifyOtp(code: string): VerifyResult {
    if (code !== DEMO_OTP || !this.pendingPhone) { return 'wrong-code'; }
    const phone = this.pendingPhone;
    if (phone === this.tracker.profile.phone) {
      this.start(phone);
      return 'existing';
    }
    if (phone === DEMO_PHONE) {
      this.tracker.resetToDemo();
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
