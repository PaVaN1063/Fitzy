import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';

import { formatPhone, isEmail } from '../core/auth.service';
import { readImage } from '../core/image';
import { TrackerService } from '../core/tracker.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage {
  form = { name: '', email: '', phone: '', city: '' };
  photo = '';
  error = '';

  constructor(private tracker: TrackerService, private nav: NavController, private toast: ToastController) {}

  ionViewWillEnter(): void {
    const p = this.tracker.profile;
    this.form = { name: p.name, email: p.email, phone: formatPhone(p.phone), city: p.city };
    this.photo = p.photo ?? '';
    this.error = '';
  }

  get initials(): string {
    const parts = (this.form.name.trim() || '?').split(/\s+/);
    return (parts[0].charAt(0) + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '')).toUpperCase();
  }

  async save(): Promise<void> {
    const name = this.form.name.trim();
    const email = this.form.email.trim().toLowerCase();
    if (name.length < 2) { this.error = 'Enter your name'; return; }
    if (email && !isEmail(email)) { this.error = 'Enter a valid email address, or leave it empty'; return; }
    this.tracker.updateProfile({ name, email, city: this.form.city.trim(), photo: this.photo || undefined });
    const t = await this.toast.create({ message: 'Profile saved', duration: 1500, position: 'top' });
    await t.present();
    this.nav.back();
  }

  /** Called by the hidden file input; opens the gallery or camera on phones. */
  async onPhoto(input: HTMLInputElement): Promise<void> {
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) { return; }
    try {
      this.photo = await readImage(file, 256);
    } catch {
      const t = await this.toast.create({ message: 'Could not use that photo. Try another one.', duration: 1800, position: 'top' });
      await t.present();
    }
  }

  removePhoto(): void {
    this.photo = '';
  }
}
