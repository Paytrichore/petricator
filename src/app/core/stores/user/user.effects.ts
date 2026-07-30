import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as UserActions from './user.actions';
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService, mapUserFromApi } from '../../../services/auth/auth.service';
import * as PeblobActions from '../peblob/peblob.actions';
import { User } from './user.model';
import { UserService } from '../../../services/auth/user.service';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private userApiUrl = environment.userApiUrl;

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.login),
      switchMap(({ email, password }) =>
        this.http.post<{ access_token: string; userStatus: User }>(`${this.userApiUrl}/auth/login`, { email, password }).pipe(
          map(res => {
            const mappedUser = mapUserFromApi(res.userStatus);
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(mappedUser));
            this.authService.updateUserData(res.userStatus);
            return UserActions.loginSuccess({ user: mappedUser, access_token: res.access_token });
          }),
          catchError(error => of(UserActions.loginFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginSuccess),
      switchMap(({ user }) => [
        UserActions.setUser({ user }),
        PeblobActions.loadPeblobsByUserIds({ userId: user._id })
      ])
    )
  );

  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signup),
      switchMap(({ username, email, password }) =>
        this.http.post<{ access_token: string; user: User }>(`${this.userApiUrl}/auth/register`, { username, email, password }).pipe(
          map(res => {
            const mappedUser = mapUserFromApi(res.user);
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('user', JSON.stringify(mappedUser));
            return UserActions.signupSuccess({ user: mappedUser, access_token: res.access_token });
          }),
          catchError(error => of(UserActions.signupFailure({ error })))
        )
      )
    )
  );

  signupSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signupSuccess),
      switchMap(({ user }) => [
        UserActions.setUser({ user }),
        PeblobActions.loadPeblobsByUserIds({ userId: user._id })
      ])
    )
  );

  hydrateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.hydrateUser),
      switchMap(() => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            return [
              UserActions.setUser({ user }),
              PeblobActions.loadPeblobsByUserIds({ userId: user._id })
            ];
          } catch {
            return [UserActions.clearUser()];
          }
        }
        return [UserActions.clearUser()];
      })
    )
  );

  makeDraftSuccess$ = createEffect(() => 
    this.actions$.pipe(
      ofType(UserActions.makeDraftSuccess),
      switchMap(({ user }) => {
        return this.http.post<User>(`${this.userApiUrl}/users/draft`, { user }).pipe(
          map(updatedUser => UserActions.updateUserSuccess({ user: mapUserFromApi(updatedUser) })),
          catchError(error => of(UserActions.updateUserFailure({ error })))
        );
      })
    )
  );
}
