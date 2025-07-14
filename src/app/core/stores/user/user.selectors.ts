import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';
import { User } from './user.types';

export const selectUserState = createFeatureSelector<UserState>('user');
export const selectUser = createSelector(selectUserState, (state: UserState) => state.user);
export const selectIsLoggedIn = createSelector(selectUser, (user: User | null) => !!user);
