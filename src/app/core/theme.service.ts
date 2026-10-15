import { Injectable } from '@angular/core';

import { Theme } from './models';

/** Applies the theme setting by putting a class on <body> (see src/theme/variables.scss). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  apply(theme: Theme): void {
    const body = document.body;
    body.classList.toggle('dark', theme === 'dark');
    body.classList.toggle('light', theme === 'light');
  }
}
