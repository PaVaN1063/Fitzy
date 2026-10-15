import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { BMI_BANDS, bmi, bmiBand, healthyWeightRange, round1 } from '../core/nutrition';

const MIN = 15;
const MAX = 40;
const CX = 140;
const CY = 136;
const R = 108;

/** Half-circle BMI gauge: four coloured bands, a needle at your value, and the healthy weight range. */
@Component({
  selector: 'app-bmi-gauge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gauge">
      <svg viewBox="0 0 280 160" role="img" [attr.aria-label]="'BMI ' + value + ', ' + band.label">
        <path *ngFor="let a of arcs" [attr.d]="a.d" [attr.stroke]="a.color" class="band" [class.dim]="a.id !== band.id"></path>
        <text *ngFor="let t of ticks" [attr.x]="t.x" [attr.y]="t.y" class="tick" text-anchor="middle">{{ t.label }}</text>
        <g class="needle" [style.transform]="'rotate(' + angle + 'deg)'">
          <path d="M140 136 L136 132 L140 44 L144 132 Z" class="needle-body"></path>
        </g>
        <circle cx="140" cy="136" r="11" class="hub"></circle>
        <circle cx="140" cy="136" r="5" [attr.fill]="band.color"></circle>
      </svg>
      <div class="readout">
        <b class="num">{{ value | number: '1.1-1' }}</b>
        <span class="chip" [style.background]="band.color">{{ band.label }}</span>
      </div>
    </div>
    <p class="note" *ngIf="showNote">
      Healthy weight for {{ heightCm }} cm: <b>{{ range.min }}–{{ range.max }} kg</b>.
      <span *ngIf="gap > 0"> You are {{ gap }} kg above it.</span>
      <span *ngIf="gap < 0"> You are {{ -gap }} kg below it.</span>
      <span *ngIf="gap === 0"> You are in the healthy range.</span>
    </p>
  `,
  styles: [`
    :host { display: block; }
    .gauge { position: relative; max-width: 300px; margin: 0 auto; }
    svg { display: block; width: 100%; height: auto; overflow: visible; }
    .band { fill: none; stroke-width: 18; stroke-linecap: round; transition: opacity .3s; }
    .band.dim { opacity: .35; }
    .tick { font-size: 11px; fill: var(--ion-color-medium, #92949c); font-variant-numeric: tabular-nums; }
    .needle { transform-origin: 140px 136px; transform-box: view-box; transition: transform .9s cubic-bezier(.3, 1.4, .5, 1); }
    .needle-body { fill: var(--ion-text-color, #111); }
    .hub { fill: var(--card-bg, #fff); stroke: var(--ion-text-color, #111); stroke-width: 3; }
    .readout { display: flex; flex-direction: column; align-items: center; margin-top: -4px; gap: 6px; }
    .num { font-family: var(--font-display, inherit); font-size: 34px; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
    .chip { color: #fff; font-size: 12px; font-weight: 700; letter-spacing: .04em; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; }
    .note { margin: 12px 4px 0; font-size: 13px; line-height: 1.5; color: var(--ion-color-medium, #6b7280); text-align: center; }
    .note b { color: var(--ion-text-color, #111); font-variant-numeric: tabular-nums; }
    @media (prefers-reduced-motion: reduce) { .needle { transition: none; } }
  `],
})
export class BmiGaugeComponent {
  @Input() weightKg = 0;
  @Input() heightCm = 0;
  @Input() showNote = true;

  readonly arcs = BMI_BANDS.map(b => ({ id: b.id, color: b.color, d: arc(b.from, b.to) }));
  readonly ticks = [18.5, 25, 30].map(v => {
    const p = point(v, R + 22);
    return { x: p.x, y: p.y + 4, label: String(v) };
  });

  get value(): number {
    return round1(bmi(this.weightKg, this.heightCm));
  }

  get band() {
    const id = bmiBand(this.value);
    return BMI_BANDS.find(b => b.id === id) ?? BMI_BANDS[1];
  }

  /** Needle rotation: −90° at BMI 15, +90° at BMI 40. */
  get angle(): number {
    return -90 + 180 * frac(this.value);
  }

  get range(): { min: number; max: number } {
    return healthyWeightRange(this.heightCm);
  }

  /** kg above (+) or below (−) the healthy range; 0 when inside it. */
  get gap(): number {
    const r = this.range;
    if (this.weightKg > r.max) { return round1(this.weightKg - r.max); }
    if (this.weightKg < r.min) { return round1(this.weightKg - r.min); }
    return 0;
  }
}

function frac(v: number): number {
  return (Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN);
}

function point(v: number, r = R): { x: number; y: number } {
  const a = Math.PI * (1 - frac(v));
  return { x: round1(CX + r * Math.cos(a)), y: round1(CY - r * Math.sin(a)) };
}

/** Arc along the gauge between two BMI values, with a small gap at each end. */
function arc(from: number, to: number): string {
  const pad = 0.35;
  const a = point(from === MIN ? from : from + pad);
  const b = point(to === MAX ? to : to - pad);
  return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`;
}
