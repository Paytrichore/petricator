import { createReducer, on } from '@ngrx/store';
import { setUser, clearUser } from './user.actions';
import { User } from './user.model';
import * as AppActions from '../app/app.actions';

export interface UserState {
  user: User | null;
}

export const initialUserState: UserState = {
  user: {
    _id: '',
    username: '',
    email: '',
    peblobs: [], 
  }
};

export const userReducer = createReducer(
  initialUserState,
  on(setUser, (state, { user }) => ({ 
    ...state, 
    user: {
      ...user,
      peblobs: user.peblobs
    }
  })),
  on(clearUser, state => ({ ...state, user: null })),
  on(AppActions.resetStore, (state) =>  { return { ...initialUserState } })
);
