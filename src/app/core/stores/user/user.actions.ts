import { createAction, props } from '@ngrx/store';

export const setUser = createAction('[User] Set User', props<{ user: any }>());
export const clearUser = createAction('[User] Clear User');
export const hydrateUser = createAction('[User] Hydrate User');
