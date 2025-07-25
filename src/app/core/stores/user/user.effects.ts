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
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService, mapUserFromApi } from '../../../services/auth/auth.service';
import * as PeblobActions from '../peblob/peblob.actions';
import { User } from './user.model';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private userApiUrl = environment.userApiUrl;

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(({ email, password }) =>
        this.http.post<{ access_token: string; userStatus: User }>(`${this.userApiUrl}/auth/login`, { email, password }).pipe(
          map(res => {
            const mappedUser = mapUserFromApi(res.userStatus);
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(mappedUser));
            this.authService.updateUserData(res.userStatus);
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
      switchMap(({ user }) => [
        setUser({ user }),
        PeblobActions.loadPeblobsByUserIds({ userId: user._id })
      ])
    )
  );

  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(signup),
      switchMap(({ username, email, password }) =>
        this.http.post<{ access_token: string; user: User }>(`${this.userApiUrl}/auth/register`, { username, email, password }).pipe(
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

  hydrateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(hydrateUser),
      switchMap(() => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            return [
              setUser({ user }),
              PeblobActions.loadPeblobsByUserIds({ userId: user._id })
            ];
          } catch {
            return [clearUser()];
          }
        }
        return [clearUser()];
      })
    )
  );
}
