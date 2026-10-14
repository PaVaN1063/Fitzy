import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { EditProfilePage } from './edit-profile.page';
import { InfoPage } from './info.page';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { ProfilePage } from './profile.page';

@NgModule({
  imports: [SharedModule, ProfilePageRoutingModule],
  declarations: [ProfilePage, EditProfilePage, InfoPage],
})
export class ProfilePageModule {}
