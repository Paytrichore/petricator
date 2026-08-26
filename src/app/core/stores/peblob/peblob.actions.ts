import { PeblobEntity, PeblobStatus } from './peblob.model';
import { createAction, props } from '@ngrx/store';
import { ComposedPeblob, RGBEffect, Tint } from '../../../shared/interfaces/peblob';

// Set peblobs from user login
export const setPeblobs = createAction('[Peblob] Set Peblobs', props<{ peblobs: PeblobEntity[] }>());
export const clearPeblobs = createAction('[Peblob] Clear Peblobs');

// Create peblob
export const createPeblob = createAction('[Peblob] Create Peblob attempt', props<{ userId: string; structure: ComposedPeblob; dominantColor: Tint }>());
export const createPeblobSuccess = createAction('[Peblob] Create Peblob Success', props<{ peblob: PeblobEntity }>());
export const createPeblobFailure = createAction('[Peblob] Create Peblob Failure', props<{ error: any }>());

// Rename peblob
export const renamePeblob = createAction('[Peblob] Rename Peblob', props<{
	peblobId: string;
	name: string;
}>());
export const renamePeblobSuccess = createAction('[Peblob] Rename Peblob Success', props<{ peblob: PeblobEntity }>());
export const renamePeblobFailure = createAction('[Peblob] Rename Peblob Failure', props<{ peblobId: string; error: any }>());

// Apply a story to one peblob. The API atomically applies the effect and charges 1 AP.
export const applyStory = createAction('[Peblob] Apply Story', props<{
	peblobId: string;
	storyId: string;
	effect: RGBEffect;
}>());
export const applyStorySuccess = createAction('[Peblob] Apply Story Success', props<{ peblob: PeblobEntity }>());
export const applyStoryFailure = createAction('[Peblob] Apply Story Failure', props<{ peblobId: string; error: any }>());

export const purchasePower = createAction('[Peblob] Purchase Power', props<{
	peblobId: string;
	powerId: string;
}>());
export const purchasePowerSuccess = createAction('[Peblob] Purchase Power Success', props<{ peblob: PeblobEntity }>());
export const purchasePowerFailure = createAction('[Peblob] Purchase Power Failure', props<{ peblobId: string; error: any }>());

// Load peblobs by IDs (nouveau)
export const loadPeblobsByUserIds = createAction('[Peblob] Load Peblobs By user IDs', props<{
	userId: string;
	page?: number;
	pageSize?: number;
	color?: Tint;
	sortOrder?: 'asc' | 'desc';
	status?: PeblobStatus;
}>());
export const loadMapPeblobsByIds = createAction('[Peblob] Load Map Peblobs By IDs', props<{ ids: string[] }>());

export const loadPeblobsSuccess = createAction('[Peblob] Load Peblobs Success', props<{
	peblobs: PeblobEntity[];
	total: number;
	page: number;
	pageSize: number;
}>());
export const loadPeblobsFailure = createAction('[Peblob] Load Peblobs Failure', props<{ error: any }>());
export const loadMapPeblobsSuccess = createAction('[Peblob] Load Map Peblobs Success', props<{ peblobs: PeblobEntity[] }>());
export const loadMapPeblobsFailure = createAction('[Peblob] Load Map Peblobs Failure', props<{ error: any }>());

export const resetStore = createAction('[Peblob] Reset Store');