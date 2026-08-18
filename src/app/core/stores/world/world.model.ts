import { Cell } from '../../../shared/interfaces/world.interface';
import { WorldError } from './world-error';

export interface WorldState {
  cells: Record<string, Cell>;
  loading: boolean;
  connected: boolean;
  error: WorldError | null;
}
