import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, switchMap, tap, toArray } from 'rxjs/operators';
import { from, of } from 'rxjs';
import * as WorldActions from './world.actions';
import { WorldService } from '../../../services/world/world.service';
import { WorldWsService } from '../../../services/world/world-ws.service';

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
          catchError((error) => of(WorldActions.loadSnapshotFailure({ error: error?.message ?? 'Unknown error' })))
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
