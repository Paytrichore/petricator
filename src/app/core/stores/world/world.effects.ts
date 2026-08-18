import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as WorldActions from './world.actions';
import * as UserActions from '../user/user.actions';
import { WorldService } from '../../../services/world/world.service';
import { WorldWsService } from '../../../services/world/world-ws.service';
import { extractWorldError } from './world-error';

@Injectable()
export class WorldEffects {
  private actions$ = inject(Actions);
  private worldService = inject(WorldService);
  private worldWsService = inject(WorldWsService);

  loadSnapshot$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorldActions.loadSnapshot),
      switchMap(() =>
        this.worldService.loadSnapshot().pipe(
          map((cells) => WorldActions.loadSnapshotSuccess({ cells })),
          catchError((error) => of(WorldActions.loadSnapshotFailure({
            error: extractWorldError(error, 'WORLD_LOAD_FAILED')
          })))
        )
      )
    )
  );

  placeOnCell$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorldActions.placeOnCell),
      switchMap(({ x, y, peblobIds }) =>
        this.worldService.placeOnCell(x, y, peblobIds[0]).pipe(
          switchMap((cell) => [
            WorldActions.cellUpdated({ cell }),
            WorldActions.placeOnCellSuccess(),
            UserActions.refreshUserStatus(),
          ]),
          catchError((error) => of(WorldActions.placeOnCellFailure({
            error: extractWorldError(error, 'PLACEMENT_FAILED')
          })))
        )
      )
    )
  );

  connectWs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorldActions.connectWs),
      tap(({ token }) => this.worldWsService.connect(token))
    ),
    { dispatch: false }
  );

  disconnectWs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorldActions.disconnectWs),
      tap(() => this.worldWsService.disconnect())
    ),
    { dispatch: false }
  );

  cellUpdated$ = createEffect(() =>
    this.worldWsService.cellUpdates$.pipe(
      map((cell) => WorldActions.cellUpdated({ cell }))
    )
  );

  connectionStatusChanged$ = createEffect(() =>
    this.worldWsService.connectionStatus$.pipe(
      map((connected) => WorldActions.wsConnectionStatusChanged({ connected }))
    )
  );
}
