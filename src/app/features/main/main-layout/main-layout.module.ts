import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', loadComponent: () => import('../../home/home.component').then(m => m.HomeComponent) },
    //   { path: 'profile', loadComponent: () => import('../profile/profile.component').then(m => m.ProfileComponent) },
    //   { path: 'battle', loadComponent: () => import('../battle/battle.component').then(m => m.BattleComponent) },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainLayoutModule {}