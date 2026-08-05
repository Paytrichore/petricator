import { createReducer, on } from '@ngrx/store';
import * as WorldActions from './world.actions';
import * as AppActions from '../app/app.actions';
import { WorldState } from './world.model';
import { Cell } from '../../../shared/interfaces/world.interface';

export const initialWorldState: WorldState = {
  cells: {},
  loading: false,
  connected: false,
  error: null
};

function normalizeCells(cells: Cell[]): Record<string, Cell> {
  return cells.reduce((acc, cell) => {
    acc[`${cell.x}_${cell.y}`] = cell;
    return acc;
  }, {} as Record<string, Cell>);
}

export const worldReducer = createReducer(
  initialWorldState,

  on(WorldActions.loadSnapshot, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(WorldActions.loadSnapshotSuccess, (state, { cells }) => ({
    ...state,
    cells: normalizeCells(cells),
    loading: false,
    error: null
  })),

  on(WorldActions.loadSnapshotFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(WorldActions.cellUpdated, (state, { cell }) => ({
    ...state,
    cells: {
      ...state.cells,
      [`${cell.x}_${cell.y}`]: cell
    }
  })),

  on(WorldActions.wsConnectionStatusChanged, (state, { connected }) => ({
    ...state,
    connected
  })),

  on(WorldActions.placeOnCell, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(WorldActions.placeOnCellSuccess, (state) => ({
    ...state,
    loading: false
  })),

  on(WorldActions.placeOnCellFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AppActions.resetStore, (state) => { return { ...initialWorldState } })
);
