import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PeblobState } from './peblob.model';

export const selectPeblobState = createFeatureSelector<PeblobState>('peblob');

export const selectPeblobs = createSelector(
  selectPeblobState,
  (state: PeblobState) => state.peblobs
);

export const selectMapPeblobs = createSelector(
  selectPeblobState,
  (state: PeblobState) => state.mapPeblobs
);

export const selectPeblobsLoading = createSelector(
  selectPeblobState,
  (state: PeblobState) => state.loading
);

export const selectMapPeblobsLoading = createSelector(
  selectPeblobState,
  (state: PeblobState) => state.mapLoading
);

export const selectPeblobsError = createSelector(
  selectPeblobState,
  (state: PeblobState) => state.error
);

export const selectPeblobsCount = createSelector(
  selectPeblobs,
  (peblobs) => peblobs.length
);

export const selectPeblobById = (id: string) => createSelector(
  selectPeblobs,
  (peblobs) => peblobs.find(peblob => peblob._id === id)
);