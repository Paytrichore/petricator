import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, filter } from 'rxjs/operators';
import { of } from 'rxjs';
import * as PeblobActions from './peblob.actions';
import * as UserActions from '../user/user.actions';
import { PeblobService } from '../../../services/peblob/peblob.service';

@Injectable()
export class PeblobEffects {
  private actions$ = inject(Actions);
  private peblobService = inject(PeblobService);

  createPeblob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PeblobActions.createPeblob),
      switchMap(({ userId, structure }) =>
        this.peblobService.createPeblob(userId, structure).pipe(
          map((peblob) => PeblobActions.createPeblobSuccess({ peblob })),
          catchError((error) => of(PeblobActions.createPeblobFailure({ error })))
        )
      )
    )
  );

  loadPeblobs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PeblobActions.loadPeblobsByUserIds),
      switchMap(({ userId }) =>
        this.peblobService.loadPeblobsByUserId(userId).pipe(
          map((peblobs) => PeblobActions.loadPeblobsSuccess({ peblobs })),
          catchError((error) => of(PeblobActions.loadPeblobsFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginSuccess),
      map(({ user }) => PeblobActions.loadPeblobsByUserIds({ userId: user._id }))
    )
  );

  signupSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signupSuccess),
      map(({ user }) => PeblobActions.loadPeblobsByUserIds({ userId: user._id }))
    )
  );
}