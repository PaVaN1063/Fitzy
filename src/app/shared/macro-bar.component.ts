import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** One labelled macro progress bar, e.g. "Protein 82 / 144 g". */
@Component({
  selector: 'app-macro-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <span class="label">{{ label }}</span>
      <span class="nums"><b>{{ value | number: '1.0-0' }}</b> / {{ max | number: '1.0-0' }} {{ unit }}</span>
    </div>
    <div class="track"><div class="fill" [style.width.%]="pct" [style.background]="color"></div></div>
  `,
  styles: [`
    :host { display: block; }
    .head { display: flex; justify-content: space-between; align-items: baseline; font-size: 13px; margin-bottom: 5px; }
    .label { color: var(--ion-color-step-600, #666); font-weight: 500; }
    .nums { font-variant-numeric: tabular-nums; color: var(--ion-color-step-600, #666); }
    .nums b { color: var(--ion-text-color, #000); font-weight: 600; }
    .track { height: 7px; border-radius: 4px; background: var(--ion-color-step-100, #e9ecef); overflow: hidden; }
    .fill { height: 100%; border-radius: 4px; transition: width .4s ease; }
  `],
})
export class MacroBarComponent {
  @Input() label = '';
  @Input() value = 0;
  @Input() max = 1;
  @Input() unit = 'g';
  @Input() color = 'var(--ion-color-primary)';

  get pct(): number {
    return this.max > 0 ? Math.min(100, (this.value / this.max) * 100) : 0;
  }
}
