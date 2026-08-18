import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { EMPTY, concat, of } from 'rxjs';
import * as PeblobActions from './peblob.actions';
import * as UserActions from '../user/user.actions';
import * as WorldActions from '../world/world.actions';
import { selectMapPeblobs } from './peblob.selectors';
import { Cell } from '../../../shared/interfaces/world.interface';
import { PeblobService } from '../../../services/peblob/peblob.service';

@Injectable()
export class PeblobEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private peblobService = inject(PeblobService);

  loadMapPeblobsFromWorld$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorldActions.loadSnapshotSuccess, WorldActions.cellUpdated),
      map((action) => {
        const cells: Cell[] = 'cells' in action ? action.cells : [action.cell];
        return cells.flatMap(cell => cell.occupants);
      }),
      map(ids => [...new Set(ids)]),
      withLatestFrom(this.store.select(selectMapPeblobs)),
      map(([ids, mapPeblobs]) => ids.filter(id => !mapPeblobs.some(peblob => peblob._id === id))),
      filter(ids => ids.length > 0),
      map(ids => PeblobActions.loadMapPeblobsByIds({ ids }))
    )
  );

  createPeblob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PeblobActions.createPeblob),
      switchMap(({ userId, structure }) =>
        this.peblobService.createPeblob(userId, structure).pipe(
          switchMap((peblob) => {
            return [
              PeblobActions.createPeblobSuccess({ peblob }),
              UserActions.refreshUserStatus(),
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

  loadMapPeblobs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PeblobActions.loadMapPeblobsByIds),
      switchMap(({ ids }) => this.peblobService.loadPeblobsByIds(ids).pipe(
        map((peblobs) => PeblobActions.loadMapPeblobsSuccess({ peblobs })),
        catchError((error) => of(PeblobActions.loadMapPeblobsFailure({ error })))
      ))
    )
  );
}
