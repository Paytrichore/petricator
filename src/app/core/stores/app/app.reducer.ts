import { createReducer, on } from '@ngrx/store';
import { initialAppState } from './app.model';
import * as AppActions from './app.actions';

export const appReducer = createReducer(
  initialAppState,
  
  on(AppActions.resetStore, (state) => ({
    ...initialAppState
  }))
);