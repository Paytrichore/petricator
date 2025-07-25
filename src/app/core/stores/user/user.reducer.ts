import { createReducer, on } from '@ngrx/store';
import { setUser, clearUser } from './user.actions';
import { User } from './user.model';
import * as AppActions from '../app/app.actions';
import * as UserActions from './user.actions';

export interface UserState {
  user: User | null;
}

export const initialUserState: UserState = {
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
  on(setUser, (state, { user }) => ({ 
    ...state, 
    user: {
      ...user,
    }
  })),
  on(UserActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    error: null
  })),
  on(clearUser, state => ({ ...state, user: null })),
  on(AppActions.resetStore, (state) =>  { return { ...initialUserState } })
);
