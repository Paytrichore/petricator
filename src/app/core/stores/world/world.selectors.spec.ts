import { initialState, mockCell, mockCell2 } from '../../../tests/mocks/world.mock';
import { WorldState } from './world.model';
import * as WorldSelectors from './world.selectors';

describe('World Selectors', () => {
  it('should select the world state', () => {
    const result = WorldSelectors.selectWorldState.projector(initialState);
    expect(result).toEqual(initialState);
  });

  describe('selectAllCells', () => {
    it('should select all cells', () => {
      const result = WorldSelectors.selectAllCells.projector(initialState);
      expect(result).toEqual([mockCell, mockCell2]);
    });

    it('should return an empty array when there are no cells', () => {
      const emptyState: WorldState = { ...initialState, cells: {} };
      const result = WorldSelectors.selectAllCells.projector(emptyState);
      expect(result).toEqual([]);
    });
  });

  describe('selectCellAt', () => {
    it('should select the cell at the given coordinates', () => {
      const selector = WorldSelectors.selectCellAt(1, 2);
      const result = selector.projector(initialState);
      expect(result).toEqual(mockCell);
    });

    it('should return undefined when no cell exists at the given coordinates', () => {
      const selector = WorldSelectors.selectCellAt(99, 99);
      const result = selector.projector(initialState);
      expect(result).toBeUndefined();
    });
  });

  describe('selectIsConnected', () => {
    it('should return true when connected', () => {
      const result = WorldSelectors.selectIsConnected.projector(initialState);
      expect(result).toBeTrue();
    });

    it('should return false when disconnected', () => {
      const disconnectedState: WorldState = { ...initialState, connected: false };
      const result = WorldSelectors.selectIsConnected.projector(disconnectedState);
      expect(result).toBeFalse();
    });
  });

  describe('selectWorldLoading', () => {
    it('should return false when not loading', () => {
      const result = WorldSelectors.selectWorldLoading.projector(initialState);
      expect(result).toBeFalse();
    });

    it('should return true when loading', () => {
      const loadingState: WorldState = { ...initialState, loading: true };
      const result = WorldSelectors.selectWorldLoading.projector(loadingState);
      expect(result).toBeTrue();
    });
  });

  describe('error state', () => {
    it('should select the error from state', () => {
      const errorState: WorldState = { ...initialState, error: 'Something went wrong' };
      const result = WorldSelectors.selectWorldState.projector(errorState);
      expect(result.error).toBe('Something went wrong');
    });

    it('should have a null error in the nominal state', () => {
      const result = WorldSelectors.selectWorldState.projector(initialState);
      expect(result.error).toBeNull();
    });
  });
});
