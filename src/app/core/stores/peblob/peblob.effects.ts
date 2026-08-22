import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { EMPTY, Observable, concat, of } from 'rxjs';
import * as PeblobActions from './peblob.actions';
import * as UserActions from '../user/user.actions';
import * as WorldActions from '../world/world.actions';
import { selectMapPeblobs } from './peblob.selectors';
import { Cell } from '../../../shared/interfaces/world.interface';
import { PeblobService } from '../../../services/peblob/peblob.service';
import { PeblobEntity } from './peblob.model';

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
      switchMap(({ userId, structure, dominantColor }) =>
        this.peblobService.createPeblob(userId, structure, dominantColor).pipe(
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

  renamePeblob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PeblobActions.renamePeblob),
      switchMap(({ peblobId, name }) => this.peblobService.updatePeblobName(peblobId, name).pipe(
        map((peblob) => PeblobActions.renamePeblobSuccess({ peblob })),
        catchError((error) => of(PeblobActions.renamePeblobFailure({ peblobId, error })))
      ))
    )
  );

  loadPeblobs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PeblobActions.loadPeblobsByUserIds),
      switchMap(({ userId, page, pageSize, color, sortOrder, status }) => {
        const cacheKey = `peblobs_${userId}_${page ?? 1}_${pageSize ?? 20}_${color ?? 'all'}_${sortOrder ?? 'desc'}_${status ?? 'all'}`;
        let cachedPage: unknown = null;

        try {
          const raw = localStorage.getItem(cacheKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            cachedPage = parsed;
          }
        } catch {
          cachedPage = null;
        }

        let cachedSuccess: Observable<ReturnType<typeof PeblobActions.loadPeblobsSuccess>> = EMPTY;
        if (cachedPage && typeof cachedPage === 'object' && 'items' in cachedPage) {
          const pageResult = cachedPage as {
            items: PeblobEntity[];
            total: number;
            page: number;
            pageSize: number;
          };
          cachedSuccess = of(PeblobActions.loadPeblobsSuccess({
            peblobs: pageResult.items,
            total: pageResult.total,
            page: pageResult.page,
            pageSize: pageResult.pageSize,
          }));
        }

        const revalidate$ = this.peblobService.loadPeblobsByUserId(userId, {
          page,
          pageSize,
          color,
          sortOrder,
          status,
        }).pipe(
          map((result) => {
            localStorage.setItem(cacheKey, JSON.stringify(result));
            return PeblobActions.loadPeblobsSuccess({
              peblobs: result.items,
              total: result.total,
              page: result.page,
              pageSize: result.pageSize,
            });
          }),
          catchError((error) => of(PeblobActions.loadPeblobsFailure({ error })))
        );

        return concat(cachedSuccess, revalidate$);
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
