import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as UserActions from './user.actions';
<<<<<<< HEAD
import { map, switchMap, catchError, tap, filter } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
=======
import { map, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
>>>>>>> origin/main
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService, mapUserFromApi } from '../../../services/auth/auth.service';
import * as PeblobActions from '../peblob/peblob.actions';
import { User } from './user.model';
<<<<<<< HEAD
import { UserEventsService } from '../../../services/auth/user-events.service';
=======
import { UserService } from '../../../services/auth/user.service';
>>>>>>> origin/main

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
<<<<<<< HEAD
  private userEventsService = inject(UserEventsService);
=======
  private userService = inject(UserService);
>>>>>>> origin/main
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
<<<<<<< HEAD
      switchMap(({ user, access_token }) => [
        UserActions.setUser({ user }),
        PeblobActions.loadPeblobsByUserIds({ userId: user._id }),
        UserActions.connectUserEvents({ token: access_token }),
=======
      switchMap(({ user }) => [
        UserActions.setUser({ user }),
        PeblobActions.loadPeblobsByUserIds({ userId: user._id })
>>>>>>> origin/main
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
<<<<<<< HEAD
      switchMap(({ user, access_token }) => [
        UserActions.setUser({ user }),
        PeblobActions.loadPeblobsByUserIds({ userId: user._id }),
        UserActions.connectUserEvents({ token: access_token }),
=======
      switchMap(({ user }) => [
        UserActions.setUser({ user }),
        PeblobActions.loadPeblobsByUserIds({ userId: user._id })
>>>>>>> origin/main
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
<<<<<<< HEAD
              PeblobActions.loadPeblobsByUserIds({ userId: user._id }),
              UserActions.connectUserEvents({ token }),
=======
              PeblobActions.loadPeblobsByUserIds({ userId: user._id })
>>>>>>> origin/main
            ];
          } catch {
            return [UserActions.clearUser()];
          }
        }
        return [UserActions.clearUser()];
<<<<<<< HEAD
=======
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
>>>>>>> origin/main
      })
    )
  );

  refreshUserStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.refreshUserStatus),
      switchMap(() => {
        return this.http.get<User>(`${this.userApiUrl}/users/me`).pipe(
          map((updatedUser) =>
            UserActions.updateUserSuccess({ user: mapUserFromApi(updatedUser) }),
          ),
          catchError(error => of(UserActions.updateUserFailure({ error })))
        );
      })
    )
  );

  connectUserEvents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.connectUserEvents),
      switchMap(({ token }) =>
        this.userEventsService.connect(token).pipe(
          filter((event) => event.type === 'draft.updated'),
          map(() => UserActions.refreshUserStatus()),
          catchError(() => EMPTY),
        ),
      ),
    ),
  );

  disconnectUserEvents$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.clearUser, UserActions.disconnectUserEvents),
        tap(() => this.userEventsService.disconnect()),
      ),
    { dispatch: false },
  );
}
