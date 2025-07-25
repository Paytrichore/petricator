import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './app.model';

export const selectAppState = createFeatureSelector<AppState>('app');

export const selectAppInitialized = createSelector(
  selectAppState,
  (state: AppState) => state.initialized
);