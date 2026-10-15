import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { TargetsPageRoutingModule } from './targets-routing.module';
import { TargetsPage } from './targets.page';

@NgModule({
  imports: [SharedModule, TargetsPageRoutingModule],
  declarations: [TargetsPage],
})
export class TargetsPageModule {}
