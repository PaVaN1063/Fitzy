import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { ScanPageRoutingModule } from './scan-routing.module';
import { ScanPage } from './scan.page';

@NgModule({
  imports: [SharedModule, ScanPageRoutingModule],
  declarations: [ScanPage],
})
export class ScanPageModule {}
