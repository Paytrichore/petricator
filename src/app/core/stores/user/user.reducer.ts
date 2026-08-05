import { createReducer, on } from '@ngrx/store';
import { setUser, clearUser } from './user.actions';
import { User } from './user.model';
import * as AppActions from '../app/app.actions';
import * as UserActions from './user.actions';

export interface UserState {
  user: User | null;
  isHydrating: boolean;
}

export const initialUserState: UserState = {
  isHydrating: true,
  user: {
    _id: '',
    username: '',
    email: '',
    actionPoints: 0,
    nextDLA: '',
    drafted: false,
    timeUntilNextDLA: {
      hours: 0,
      minutes: 0,
    },
  }
};

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.hydrateUser, (state) => ({
    ...state,
    isHydrating: true,
  })),
  on(setUser, (state, { user }) => ({ 
    ...state, 
    user: {
      ...user,
    },
    isHydrating: false,
  })),
  on(UserActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    user,
  })),
  on(clearUser, state => ({ ...state, user: null, isHydrating: false })),
  on(AppActions.resetStore, (state) =>  { return { ...initialUserState } })
);
