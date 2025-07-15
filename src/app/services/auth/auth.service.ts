import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Store } from '@ngrx/store';
import { login, signup, resetStore } from '../../core/stores/user/user.actions';
import { User } from '../../core/stores/user/user.types';

export function mapUserFromApi(user: any): User {
  // On copie toutes les clés sauf password et __v
  const { password, __v, ...rest } = user;
  return rest as User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private store = inject(Store);
  private apiUrl = environment.apiUrl;

  login(email: string, password: string): void {
    this.store.dispatch(login({ email, password }));
  }

  signup(username: string, email: string, password: string): void {
    this.store.dispatch(signup({ username, email, password }));
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']).then(() => {
      this.store.dispatch(resetStore());
    });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}