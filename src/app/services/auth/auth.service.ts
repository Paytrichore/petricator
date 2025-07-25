import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { User } from '../../core/stores/user/user.model';
import * as AppActions from '../../core/stores/app/app.actions';
import * as UserActions from '../../core/stores/user/user.actions';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export function mapUserFromApi(user: any): User {
  // On copie toutes les clés sauf password et __v
  const { password, __v, ...rest } = user;
  return rest as User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private store = inject(Store);
  private http = inject(HttpClient);
  private userApiUrl = environment.userApiUrl;

  constructor() {
    // Vérifie l'authentification au démarrage
    this.checkAuthOnInit();
  }

  private checkAuthOnInit(): void {
    if (this.hasValidToken()) {
      this.checkUserStatusOnRefresh();
    }
  }

  login(email: string, password: string): void {
    this.store.dispatch(UserActions.login({ email, password }));
  }

  signup(username: string, email: string, password: string): void {
    this.store.dispatch(UserActions.signup({ username, email, password }));
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']).then(() => {
      this.store.dispatch(AppActions.resetStore());
    });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  hasValidToken(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      return !isExpired;
    } catch {
      return false;
    }
  }

  updateUserData(userData: any): void {
    const mappedUser = mapUserFromApi(userData);
    
    localStorage.setItem('user', JSON.stringify(mappedUser));
    
    this.store.dispatch(UserActions.updateUserSuccess({ user: mappedUser }));
  }

  checkUserStatusOnRefresh(): void {
    if (this.hasValidToken()) {
      this.http.get(`${this.userApiUrl}/users/me`)
        .subscribe({
          next: (userData) => {
            this.updateUserData(userData);
          },
          error: (error) => {
            console.error('Erreur lors de la vérification du statut utilisateur:', error);
            if (error.status === 401) {
              this.logout();
            }
          }
        });
    }
  }

  useActionPoints(points: number): Observable<any> {
    return this.http.post(`${this.userApiUrl}/users/use-points`, { points });
  }

  makeDraft(): Observable<any> {
    return this.http.post(`${this.userApiUrl}/users/draft`, {});
  }

  refreshUserStatus(): void {
    this.checkUserStatusOnRefresh();
  }
}