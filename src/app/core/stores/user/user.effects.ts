import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { setUser, clearUser, hydrateUser } from './user.actions';
import { tap, map } from 'rxjs/operators';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);

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
