import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { path: 'today', loadChildren: () => import('../today/today.module').then(m => m.TodayPageModule) },
      { path: 'water', loadChildren: () => import('../water/water.module').then(m => m.WaterPageModule) },
      { path: 'scan', loadChildren: () => import('../scan/scan.module').then(m => m.ScanPageModule) },
      { path: 'progress', loadChildren: () => import('../progress/progress.module').then(m => m.ProgressPageModule) },
      { path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule) },
      { path: '', redirectTo: 'today', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'tabs/today', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/today' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
