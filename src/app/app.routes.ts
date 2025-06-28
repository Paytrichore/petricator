import { Routes } from '@angular/router';
import { authGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./features/main/main-layout/main-layout.module').then(m => m.MainLayoutModule)
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth-layout/auth-layout.module').then(m => m.AuthLayoutModule)
  },
  { path: '**', redirectTo: '' }
];