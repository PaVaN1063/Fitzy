import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { AuthService, OTP_LENGTH, VerifyResult, formatPhone } from '../core/auth.service';

type State = 'typing' | 'checking' | 'error' | 'success';

/**
 * Bottom drawer for the one-time code. One real <input> (so SMS autofill and paste work)
 * sits invisibly over the boxes that show each digit.
 */
@Component({
  selector: 'app-otp-sheet',
  templateUrl: './otp-sheet.component.html',
  styleUrls: ['./otp-sheet.component.scss'],
})
export class OtpSheetComponent implements AfterViewInit, OnDestroy {
  @Input() phone = '';
  @ViewChild('codeInput') codeInput?: ElementRef<HTMLInputElement>;

  readonly slots = Array.from({ length: OTP_LENGTH }, (_, i) => i);

  code = '';
  state: State = 'typing';
  focused = false;
  resendIn = 30;

  private timer?: ReturnType<typeof setInterval>;
  private pending?: ReturnType<typeof setTimeout>;

  constructor(private auth: AuthService, private modal: ModalController) {}

  ngAfterViewInit(): void {
    this.startCountdown();
    setTimeout(() => this.focus(), 350);
  }

  ngOnDestroy(): void {
    if (this.timer) { clearInterval(this.timer); }
    if (this.pending) { clearTimeout(this.pending); }
  }

  get pretty(): string {
    return formatPhone(this.phone);
  }

  get message(): string {
    switch (this.state) {
      case 'error': return 'That code is not right. Try again.';
      case 'success': return 'Verified';
      case 'checking': return 'Checking…';
      default: return '';
    }
  }

  focus(): void {
    this.codeInput?.nativeElement.focus();
  }

  onInput(value: string): void {
    const digits = (value || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    this.code = digits;
    if (this.codeInput && this.codeInput.nativeElement.value !== digits) {
      this.codeInput.nativeElement.value = digits;
    }
    if (this.state === 'error') { this.state = 'typing'; }
    if (digits.length === OTP_LENGTH) { this.verify(); }
  }

  verify(): void {
    if (this.code.length !== OTP_LENGTH || this.state === 'checking' || this.state === 'success') { return; }
    this.state = 'checking';
    this.pending = setTimeout(() => {
      const result: VerifyResult = this.auth.verifyOtp(this.code);
      if (result === 'wrong-code') {
        this.state = 'error';
        if (navigator.vibrate) { navigator.vibrate(120); }
        this.pending = setTimeout(() => {
          this.code = '';
          if (this.codeInput) { this.codeInput.nativeElement.value = ''; }
          this.focus();
        }, 650);
        return;
      }
      this.state = 'success';
      this.pending = setTimeout(() => this.modal.dismiss(result, 'verified'), 750);
    }, 500);
  }

  resend(): void {
    if (this.resendIn > 0) { return; }
    this.auth.requestOtp(this.phone);
    this.code = '';
    this.state = 'typing';
    if (this.codeInput) { this.codeInput.nativeElement.value = ''; }
    this.startCountdown();
    this.focus();
  }

  editNumber(): void {
    this.modal.dismiss(null, 'edit');
  }

  private startCountdown(): void {
    if (this.timer) { clearInterval(this.timer); }
    this.resendIn = 30;
    this.timer = setInterval(() => {
      this.resendIn = Math.max(0, this.resendIn - 1);
      if (this.resendIn === 0 && this.timer) { clearInterval(this.timer); }
    }, 1000);
  }
}
