import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  login(email: string, password: string): Observable<{ access_token: string, user: any }> {
    return this.http.post<{ access_token: string, user: any }>(
      `${this.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access_token);
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
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}