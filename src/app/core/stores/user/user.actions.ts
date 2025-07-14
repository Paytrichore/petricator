import { createAction, props } from '@ngrx/store';
import { User } from './user.types';

export const login = createAction('[Auth] Login attempt', props<{ email: string; password: string }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: User; access_token: string }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: any }>());

export const signup = createAction('[Auth] Signup attempt', props<{ username: string; email: string; password: string }>());
export const signupSuccess = createAction('[Auth] Signup Success', props<{ user: User; access_token: string }>());
export const signupFailure = createAction('[Auth] Signup Failure', props<{ error: any }>());

export const setUser = createAction('[User] Set User', props<{ user: User }>());
export const clearUser = createAction('[User] Clear User');
export const hydrateUser = createAction('[User] Hydrate User');
