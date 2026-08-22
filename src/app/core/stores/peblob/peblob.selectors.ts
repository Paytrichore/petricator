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
  (state: PeblobState | undefined) => state?.loading ?? false
);

export const selectMapPeblobsLoading = createSelector(
  selectPeblobState,
  (state: PeblobState | undefined) => state?.mapLoading ?? false
);

export const selectPeblobsError = createSelector(
  selectPeblobState,
  (state: PeblobState | undefined) => state?.error ?? null
);

export const selectPeblobsCount = createSelector(
  selectPeblobs,
  (peblobs) => peblobs.length
);

export const selectPeblobsTotal = createSelector(
  selectPeblobState,
  (state) => state?.total ?? 0
);

export const selectPeblobsPage = createSelector(
  selectPeblobState,
  (state) => state?.page ?? 1
);

export const selectPeblobsPageSize = createSelector(
  selectPeblobState,
  (state) => state?.pageSize ?? 20
);

export const selectRenamingPeblobIds = createSelector(
  selectPeblobState,
  (state) => state?.renamingPeblobIds ?? []
);

export const selectPeblobById = (id: string) => createSelector(
  selectPeblobs,
  (peblobs) => peblobs.find(peblob => peblob._id === id)
);