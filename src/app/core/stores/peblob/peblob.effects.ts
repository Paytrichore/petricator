import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, filter, withLatestFrom } from 'rxjs/operators';
import { EMPTY, concat, of } from 'rxjs';
import * as PeblobActions from './peblob.actions';
import * as UserActions from '../user/user.actions';
import { PeblobService } from '../../../services/peblob/peblob.service';
import { Store } from '@ngrx/store';
import { selectUser } from '../user/user.selectors';

@Injectable()
export class PeblobEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private peblobService = inject(PeblobService);

  createPeblob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PeblobActions.createPeblob),
      switchMap(({ userId, structure }) =>
        this.peblobService.createPeblob(userId, structure).pipe(
          withLatestFrom(this.store.select(selectUser)),
          filter(([_, user]) => !!user),
          switchMap(([peblob, user]) => {
            return [
              PeblobActions.createPeblobSuccess({ peblob }),
              UserActions.makeDraftSuccess({ user:user! })
            ];
          }),
          catchError((error) => of(PeblobActions.createPeblobFailure({ error })))
        )
      )
    )
  );

  loadPeblobs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PeblobActions.loadPeblobsByUserIds),
      switchMap(({ userId }) => {
        const cacheKey = `peblobs_${userId}`;
        let cachedPeblobs: any[] | null = null;

        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              cachedPeblobs = parsed;
            }
          }
        } catch {
          cachedPeblobs = null;
        }

        const cached$ = cachedPeblobs
          ? of(PeblobActions.loadPeblobsSuccess({ peblobs: cachedPeblobs }))
          : EMPTY;

        const revalidate$ = this.peblobService.loadPeblobsByUserId(userId).pipe(
          map((peblobs) => {
            localStorage.setItem(cacheKey, JSON.stringify(peblobs));
            return PeblobActions.loadPeblobsSuccess({ peblobs });
          }),
          catchError((error) => of(PeblobActions.loadPeblobsFailure({ error })))
        );

        return concat(cached$, revalidate$);
      })
    )
  );
}