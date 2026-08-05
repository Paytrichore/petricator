import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorldState } from './world.model';

export const selectWorldState = createFeatureSelector<WorldState>('world');

export const selectAllCells = createSelector(
  selectWorldState,
  (state: WorldState) => Object.values(state.cells)
);

export const selectCellAt = (x: number, y: number) => createSelector(
  selectWorldState,
  (state: WorldState) => state.cells[`${x}_${y}`]
);

export const selectIsConnected = createSelector(
  selectWorldState,
  (state: WorldState) => state.connected
);

export const selectWorldLoading = createSelector(
  selectWorldState,
  (state: WorldState) => state.loading
);
