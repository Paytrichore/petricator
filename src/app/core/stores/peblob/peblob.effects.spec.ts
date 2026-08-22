import { TestBed } from '@angular/core/testing';
import { Action } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ReplaySubject, of, throwError } from 'rxjs';
import { PeblobEffects } from './peblob.effects';
import * as PeblobActions from './peblob.actions';
import { PeblobService } from '../../../services/peblob/peblob.service';
import { PeblobEntity } from './peblob.model';

describe('Peblob Effects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: PeblobEffects;
  let peblobService: jasmine.SpyObj<PeblobService>;

  const peblob: PeblobEntity = {
    _id: 'peblob-1',
    userId: 'user-1',
    structure: [[{ r: 1, g: 2, b: 3 }]],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
    name: 'Nouveau nom',
  };

  beforeEach(() => {
    actions$ = new ReplaySubject<Action>(1);
    peblobService = jasmine.createSpyObj<PeblobService>('PeblobService', ['updatePeblobName']);

    TestBed.configureTestingModule({
      providers: [
        PeblobEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: PeblobService, useValue: peblobService },
      ],
    });

    effects = TestBed.inject(PeblobEffects);
  });

  it('dispatches rename success after updating the name', (done) => {
    peblobService.updatePeblobName.and.returnValue(of(peblob));

    effects.renamePeblob$.subscribe((action) => {
      expect(action).toEqual(PeblobActions.renamePeblobSuccess({ peblob }));
      expect(peblobService.updatePeblobName).toHaveBeenCalledWith('peblob-1', 'Nouveau nom');
      done();
    });

    actions$.next(PeblobActions.renamePeblob({ peblobId: 'peblob-1', name: 'Nouveau nom' }));
  });

  it('dispatches rename failure when the update fails', (done) => {
    const error = new Error('update failed');
    peblobService.updatePeblobName.and.returnValue(throwError(() => error));

    effects.renamePeblob$.subscribe((action) => {
      expect(action).toEqual(PeblobActions.renamePeblobFailure({ peblobId: 'peblob-1', error }));
      done();
    });

    actions$.next(PeblobActions.renamePeblob({ peblobId: 'peblob-1', name: 'Nouveau nom' }));
  });
});
