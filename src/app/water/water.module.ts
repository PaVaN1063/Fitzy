import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { WaterPageRoutingModule } from './water-routing.module';
import { WaterPage } from './water.page';

@NgModule({
  imports: [SharedModule, WaterPageRoutingModule],
  declarations: [WaterPage],
})
export class WaterPageModule {}
