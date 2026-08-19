import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReplaySubject } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { UserEffects } from './user.effects';
import * as UserActions from './user.actions';
import { User } from './user.model';
import { AuthService } from '../../../services/auth/auth.service';
import { UserEventsService } from '../../../services/auth/user-events.service';

const user: User = {
  _id: 'user-1',
  username: 'player',
  email: 'player@example.com',
  actionPoints: 2,
  nextDLA: '',
  drafted: true,
  timeUntilNextDLA: { hours: 0, minutes: 0 },
};

describe('UserEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: UserEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);

    TestBed.configureTestingModule({
      providers: [
        UserEffects,
        provideMockActions(() => actions$),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: {} },
        { provide: UserEventsService, useValue: {} },
      ],
    });

    effects = TestBed.inject(UserEffects);
  });

  it('should refresh user status after the next DLA expires', fakeAsync(() => {
    const refreshSpy = jasmine.createSpy('refreshSpy');
    effects.refreshUserStatusOnDlaExpiry$.subscribe(action => {
      if (action.type === UserActions.refreshUserStatus.type) {
        refreshSpy();
      }
    });

    actions$.next(UserActions.setUser({
      user: {
        ...user,
        nextDLA: new Date(Date.now() + 1000).toISOString(),
      },
    }));

    tick(1499);
    expect(refreshSpy).not.toHaveBeenCalled();

    tick(1);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  }));

  it('should wait at least one second when the DLA is already expired', fakeAsync(() => {
    const refreshSpy = jasmine.createSpy('refreshSpy');
    effects.refreshUserStatusOnDlaExpiry$.subscribe(action => {
      if (action.type === UserActions.refreshUserStatus.type) {
        refreshSpy();
      }
    });

    actions$.next(UserActions.setUser({
      user: {
        ...user,
        nextDLA: new Date(Date.now() - 1000).toISOString(),
      },
    }));

    tick(999);
    expect(refreshSpy).not.toHaveBeenCalled();

    tick(1);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  }));
});
