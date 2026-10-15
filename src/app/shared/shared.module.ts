import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { BmiGaugeComponent } from './bmi-gauge.component';
import { FoodSearchComponent } from './food-search.component';
import { MacroBarComponent } from './macro-bar.component';
import { RingComponent } from './ring.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  declarations: [RingComponent, MacroBarComponent, FoodSearchComponent, BmiGaugeComponent],
  exports: [CommonModule, FormsModule, IonicModule, RingComponent, MacroBarComponent, FoodSearchComponent, BmiGaugeComponent],
})
export class SharedModule {}
