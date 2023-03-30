import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IonRefresherPage } from './ion-refresher.page';

const routes: Routes = [
  {
    path: '',
    component: IonRefresherPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IonRefresherPageRoutingModule {}
