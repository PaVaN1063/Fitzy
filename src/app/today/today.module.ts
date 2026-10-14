import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { TodayPageRoutingModule } from './today-routing.module';
import { TodayPage } from './today.page';

@NgModule({
  imports: [SharedModule, TodayPageRoutingModule],
  declarations: [TodayPage],
})
export class TodayPageModule {}
