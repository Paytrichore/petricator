import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as UserActions from './user.actions';
import { map, switchMap, catchError, tap, filter } from 'rxjs/operators';
import { EMPTY, of, timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService, mapUserFromApi } from '../../../services/auth/auth.service';
import * as PeblobActions from '../peblob/peblob.actions';
import * as WorldActions from '../world/world.actions';
import { User } from './user.model';
import { UserEventsService } from '../../../services/auth/user-events.service';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private userEventsService = inject(UserEventsService);
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
      switchMap(({ user, access_token }) => [
        UserActions.setUser({ user }),
        PeblobActions.loadPeblobsByUserIds({ userId: user._id }),
        UserActions.connectUserEvents({ token: access_token }),
        WorldActions.connectWs({ token: access_token }),
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
      switchMap(({ user, access_token }) => [
        UserActions.setUser({ user }),
        PeblobActions.loadPeblobsByUserIds({ userId: user._id }),
        UserActions.connectUserEvents({ token: access_token }),
        WorldActions.connectWs({ token: access_token }),
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
              PeblobActions.loadPeblobsByUserIds({ userId: user._id }),
              UserActions.connectUserEvents({ token }),
              WorldActions.connectWs({ token }),
            ];
          } catch {
            return [UserActions.clearUser()];
          }
        }
        return [UserActions.clearUser()];
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

  refreshUserStatusOnDlaExpiry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        UserActions.setUser,
        UserActions.updateUserSuccess,
        UserActions.clearUser,
        UserActions.disconnectUserEvents,
      ),
      switchMap(action => {
        if (!('user' in action)) {
          return EMPTY;
        }

        const dlaTimestamp = Date.parse(action.user.nextDLA);
        if (!Number.isFinite(dlaTimestamp)) {
          return EMPTY;
        }

        const delay = Math.max(dlaTimestamp - Date.now() + 500, 1000);
        return timer(delay).pipe(
          map(() => UserActions.refreshUserStatus()),
        );
      }),
    ),
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

  disconnectWorldWs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.clearUser, UserActions.disconnectUserEvents),
      map(() => WorldActions.disconnectWs()),
    ),
  );
}
