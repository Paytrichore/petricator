import { createAction, props } from '@ngrx/store';
import { PeblobEntity } from './peblob.model';
import { ComposedPeblob } from '../../../shared/interfaces/peblob';

// Set peblobs from user login
export const setPeblobs = createAction('[Peblob] Set Peblobs', props<{ peblobs: PeblobEntity[] }>());
export const clearPeblobs = createAction('[Peblob] Clear Peblobs');

// Create peblob
export const createPeblob = createAction('[Peblob] Create Peblob attempt', props<{ userId: string; structure: ComposedPeblob }>());
export const createPeblobSuccess = createAction('[Peblob] Create Peblob Success', props<{ peblob: PeblobEntity }>());
export const createPeblobFailure = createAction('[Peblob] Create Peblob Failure', props<{ error: any }>());

// Load peblobs by IDs (nouveau)
export const loadPeblobsByUserIds = createAction('[Peblob] Load Peblobs By user IDs', props<{ userId: string }>());

export const loadPeblobsSuccess = createAction('[Peblob] Load Peblobs Success', props<{ peblobs: PeblobEntity[] }>());
export const loadPeblobsFailure = createAction('[Peblob] Load Peblobs Failure', props<{ error: any }>());

export const resetStore = createAction('[Peblob] Reset Store');