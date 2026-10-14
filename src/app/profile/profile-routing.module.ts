import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditProfilePage } from './edit-profile.page';
import { InfoPage } from './info.page';
import { ProfilePage } from './profile.page';

const routes: Routes = [
  { path: '', component: ProfilePage },
  { path: 'edit', component: EditProfilePage },
  { path: 'targets', loadChildren: () => import('../targets/targets.module').then(m => m.TargetsPageModule) },
  { path: 'info/:topic', component: InfoPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
