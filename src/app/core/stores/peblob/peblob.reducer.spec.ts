import { PeblobEntity } from './peblob.model';
import * as PeblobActions from './peblob.actions';
import { initialPeblobState, peblobReducer } from './peblob.reducer';
import { Tint } from '../../../shared/interfaces/peblob';

describe('Peblob Reducer', () => {
  const originalPeblob: PeblobEntity = {
    _id: 'peblob-1',
    userId: 'user-1',
    structure: [[{ r: 1, g: 2, b: 3 }]],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    name: 'Ancien nom',
    dominantColor: Tint.BLUE,
  };
  const renamedPeblob: PeblobEntity = {
    ...originalPeblob,
    name: 'Nouveau nom',
    updatedAt: new Date('2026-01-02'),
  };

  it('updates the renamed peblob in the collection and map caches', () => {
    const state = {
      ...initialPeblobState,
      peblobs: [originalPeblob],
      mapPeblobs: [originalPeblob],
    };

    const result = peblobReducer(
      state,
      PeblobActions.renamePeblobSuccess({ peblob: renamedPeblob })
    );

    expect(result.peblobs).toEqual([renamedPeblob]);
    expect(result.mapPeblobs).toEqual([renamedPeblob]);
    expect(result.peblobs).not.toBe(state.peblobs);
  });

  it('keeps the existing collections when the renamed peblob is not loaded', () => {
    const state = {
      ...initialPeblobState,
      peblobs: [originalPeblob],
      mapPeblobs: [originalPeblob],
    };

    const result = peblobReducer(
      state,
      PeblobActions.renamePeblobSuccess({
        peblob: { ...renamedPeblob, _id: 'unknown' },
      })
    );

    expect(result.peblobs).toEqual([originalPeblob]);
    expect(result.mapPeblobs).toEqual([originalPeblob]);
  });
});
