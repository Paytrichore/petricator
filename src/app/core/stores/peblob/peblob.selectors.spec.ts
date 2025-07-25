import { initialState, mockPeblob } from '../../../tests/mocks/peblob.mock';
import * as PeblobSelectors from './peblob.selectors';

describe('Peblob Selectors', () => {
  it('should select the peblob state', () => {
    const result = PeblobSelectors.selectPeblobState.projector(initialState);
    expect(result).toEqual(initialState);
  });

  it('should select peblobs', () => {
    const result = PeblobSelectors.selectPeblobs.projector(initialState);
    expect(result).toEqual([mockPeblob]);
  });

  it('should select loading', () => {
    const result = PeblobSelectors.selectPeblobsLoading.projector(initialState);
    expect(result).toBe(false);
  });

  it('should select error', () => {
    const result = PeblobSelectors.selectPeblobsError.projector(initialState);
    expect(result).toBeNull();
  });

  it('should select peblobs count', () => {
    const result = PeblobSelectors.selectPeblobsCount.projector([mockPeblob]);
    expect(result).toBe(1);
  });

  it('should select peblob by id', () => {
    const selector = PeblobSelectors.selectPeblobById('p1');
    const result = selector.projector([mockPeblob]);
    expect(result).toEqual(mockPeblob);
  });

  it('should return undefined for unknown peblob id', () => {
    const selector = PeblobSelectors.selectPeblobById('unknown');
    const result = selector.projector([mockPeblob]);
    expect(result).toBeUndefined();
  });
});