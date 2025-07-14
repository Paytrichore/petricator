import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Store } from '@ngrx/store';
import { setUser } from '../../core/stores/user/user.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private store = inject(Store);
  private apiUrl = environment.apiUrl;

  login(email: string, password: string): Observable<{ access_token: string, user: any }> {
    return this.http.post<{ access_token: string, user: any }>(
      `${this.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.store.dispatch(setUser({ user: res.user }));
      })
    );
  }

  signup(username: string, email: string, password: string): Observable<{ access_token: string, user: any }> {
    return this.http.post<{ access_token: string, user: any }>(
      `${this.apiUrl}/auth/register`,
      { username, email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.store.dispatch(setUser({ user: res.user }));
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}