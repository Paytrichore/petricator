import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', loadComponent: () => import('../../home/home.component').then(m => m.HomeComponent) },
      { path: 'profile', loadComponent: () => import('../../home/home.component').then(m => m.HomeComponent) },
      { path: 'collection', loadComponent: () => import('../../collection/collection/collection.component').then(m => m.CollectionComponent) },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainLayoutModule {}