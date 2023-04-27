import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryStepsPageRoutingModule } from './delivery-steps-routing.module';

import { DeliveryStepsPage } from './delivery-steps.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryStepsPageRoutingModule
  ],
  declarations: [DeliveryStepsPage]
})
export class DeliveryStepsPageModule {}
