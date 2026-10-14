import { Component } from '@angular/core';

import { ThemeService } from './core/theme.service';
import { TrackerService } from './core/tracker.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(tracker: TrackerService, theme: ThemeService) {
    theme.apply(tracker.settings.theme);
  }
}
