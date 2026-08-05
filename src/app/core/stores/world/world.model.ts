import { Cell } from '../../../shared/interfaces/world.interface';

export interface WorldState {
  cells: Record<string, Cell>;
  loading: boolean;
  connected: boolean;
  error: string | null;
}
