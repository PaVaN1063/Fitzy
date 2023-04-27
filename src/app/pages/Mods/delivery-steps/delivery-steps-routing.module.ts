import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryStepsPage } from './delivery-steps.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryStepsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryStepsPageRoutingModule {}
