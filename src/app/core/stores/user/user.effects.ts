import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  setUser,
  clearUser,
  hydrateUser,
  login,
  loginSuccess,
  loginFailure,
  signup,
  signupSuccess,
  signupFailure
} from './user.actions';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { mapUserFromApi } from '../../../services/auth/auth.service';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(({ email, password }) =>
        this.http.post<{ access_token: string; user: any }>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
          map(res => {
            const mappedUser = mapUserFromApi(res.user);
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(mappedUser));
            return loginSuccess({ user: mappedUser, access_token: res.access_token });
          }),
          catchError(error => of(loginFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginSuccess),
      map(({ user }) => setUser({ user }))
    )
  );

  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(signup),
      switchMap(({ username, email, password }) =>
        this.http.post<{ access_token: string; user: any }>(`${this.apiUrl}/auth/register`, { username, email, password }).pipe(
          map(res => {
            const mappedUser = mapUserFromApi(res.user);
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(mappedUser));
            return signupSuccess({ user: mappedUser, access_token: res.access_token });
          }),
          catchError(error => of(signupFailure({ error })))
        )
      )
    )
  );

  signupSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(signupSuccess),
      map(({ user }) => setUser({ user }))
    )
  );

  setUser$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(setUser),
        tap(action => {
          // Side effect possible ici
        })
      ),
    { dispatch: false }
  );

  clearUser$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(clearUser),
        tap(() => {
          // Side effect possible ici
        })
      ),
    { dispatch: false }
  );

  hydrateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(hydrateUser),
      map(() => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            return setUser({ user });
          } catch {
            return clearUser();
          }
        }
        return clearUser();
      })
    )
  );

  constructor() {}
}
