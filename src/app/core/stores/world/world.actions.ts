import { createAction, props } from '@ngrx/store';
import { Cell } from '../../../shared/interfaces/world.interface';
import { WorldError } from './world-error';

export const loadSnapshot = createAction('[World] Load Snapshot');
export const loadSnapshotSuccess = createAction('[World] Load Snapshot Success', props<{ cells: Cell[] }>());
export const loadSnapshotFailure = createAction('[World] Load Snapshot Failure', props<{ error: WorldError }>());

export const cellUpdated = createAction('[World] Cell Updated', props<{ cell: Cell }>());

export const connectWs = createAction('[World] Connect Ws', props<{ token: string }>());
export const disconnectWs = createAction('[World] Disconnect Ws');
export const wsConnectionStatusChanged = createAction('[World] Ws Connection Status Changed', props<{ connected: boolean }>());

// Places one or more peblobs on a cell; the resulting cell state comes back via the `cell:update` WS event, not the HTTP response.
export const placeOnCell = createAction('[World] Place On Cell', props<{ x: number; y: number; peblobIds: string[] }>());
export const placeOnCellSuccess = createAction('[World] Place On Cell Success');
export const placeOnCellFailure = createAction('[World] Place On Cell Failure', props<{ error: WorldError }>());
