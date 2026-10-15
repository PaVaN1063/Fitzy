import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Circular progress ring. Projected content is centred inside it. */
@Component({
  selector: 'app-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ring" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" [attr.width]="size" [attr.height]="size" aria-hidden="true">
        <circle [attr.cx]="size / 2" [attr.cy]="size / 2" [attr.r]="radius" fill="none"
                class="track" [attr.stroke-width]="stroke"></circle>
        <circle [attr.cx]="size / 2" [attr.cy]="size / 2" [attr.r]="radius" fill="none"
                [attr.stroke]="over ? 'var(--ion-color-warning)' : color" [attr.stroke-width]="stroke"
                stroke-linecap="round" [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="offset" [attr.transform]="'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'"
                class="bar"></circle>
      </svg>
      <div class="center"><ng-content></ng-content></div>
    </div>
  `,
  styles: [`
    .ring { position: relative; flex: none; }
    .track { stroke: var(--ion-color-step-100, #e9ecef); }
    .bar { transition: stroke-dashoffset .5s ease; }
    .center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    @media (prefers-reduced-motion: reduce) { .bar { transition: none; } }
  `],
})
export class RingComponent {
  @Input() value = 0;
  @Input() max = 1;
  @Input() size = 120;
  @Input() stroke = 10;
  @Input() color = 'var(--ion-color-primary)';

  get radius(): number {
    return (this.size - this.stroke) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get over(): boolean {
    return this.max > 0 && this.value > this.max * 1.05;
  }

  get offset(): number {
    const pct = this.max > 0 ? Math.min(1, Math.max(0, this.value / this.max)) : 0;
    return this.circumference * (1 - pct);
  }
}
