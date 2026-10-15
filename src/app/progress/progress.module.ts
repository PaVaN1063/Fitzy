import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ProgressPageRoutingModule } from './progress-routing.module';
import { ProgressPage } from './progress.page';

@NgModule({
  imports: [SharedModule, ProgressPageRoutingModule],
  declarations: [ProgressPage],
})
export class ProgressPageModule {}
