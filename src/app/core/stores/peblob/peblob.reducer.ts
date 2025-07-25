import { createReducer, on } from '@ngrx/store';
import * as PeblobActions from './peblob.actions';
import * as AppActions from '../app/app.actions';
import { PeblobState } from './peblob.model';

export const initialPeblobState: PeblobState = {
  peblobs: [],
  loading: false,
  error: null
};

export const peblobReducer = createReducer(
  initialPeblobState,
  
  // Set peblobs
  on(PeblobActions.setPeblobs, (state, { peblobs }) => ({
    ...state,
    peblobs,
    loading: false,
    error: null
  })),
  
  // Clear peblobs
  // on(PeblobActions.clearPeblobs, (state) => ({
  //   ...state,
  //   peblobs: [],
  //   loading: false,
  //   error: null
  // })),
  
  // Create peblob
  on(PeblobActions.createPeblob, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(PeblobActions.createPeblobSuccess, (state, { peblob }) => ({
    ...state,
    peblobs: [...state.peblobs, peblob],
    loading: false,
    error: null
  })),
  
  on(PeblobActions.createPeblobFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(PeblobActions.loadPeblobsByUserIds, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
 
  on(PeblobActions.loadPeblobsSuccess, (state, { peblobs }) => ({
    ...state,
    peblobs,
    loading: false,
    error: null
  })),
  on(PeblobActions.loadPeblobsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(AppActions.resetStore, (state) =>  { return { ...initialPeblobState } })
);