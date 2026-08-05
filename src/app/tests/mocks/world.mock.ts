import { WorldState } from '../../core/stores/world/world.model';
import { Cell } from '../../shared/interfaces/world.interface';

export const mockCell: Cell = {
  _id: 'c1',
  x: 1,
  y: 2,
  occupants: ['u1'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

export const mockCell2: Cell = {
  _id: 'c2',
  x: 5,
  y: 5,
  occupants: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

export const initialState: WorldState = {
  cells: {
    '1_2': mockCell,
    '5_5': mockCell2
  },
  loading: false,
  connected: true,
  error: null
};
