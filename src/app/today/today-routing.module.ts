import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TodayPage } from './today.page';

const routes: Routes = [{ path: '', component: TodayPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TodayPageRoutingModule {}
