import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'folder/Inbox',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'ion-refresher',
    loadChildren: () => import('./ionic-Components/ion-refresher/ion-refresher.module').then( m => m.IonRefresherPageModule)
  },
  {
    path: 'ion-modal',
    loadChildren: () => import('./ionic-Components/ion-modal/ion-modal.module').then( m => m.IonModalPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
