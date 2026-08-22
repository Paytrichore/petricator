import { ComposedPeblob } from '../../../shared/interfaces/peblob';
import { Tint } from '../../../shared/interfaces/peblob';

export enum PeblobStatus {
  AVAILABLE = 'AVAILABLE',
  ON_MAP = 'ON_MAP',
}

export interface PeblobEntity {
  _id: string;
  userId: string;
  structure: ComposedPeblob;
  createdAt: Date;
  updatedAt: Date;
  ownerName?: string;
  name?: string;
  dominantColor?: Tint;
  status?: PeblobStatus;
}

export interface PeblobPage {
  items: PeblobEntity[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PeblobState {
  peblobs: PeblobEntity[];
  mapPeblobs: PeblobEntity[];
  loading: boolean;
  mapLoading: boolean;
  error: any;
  total: number;
  page: number;
  pageSize: number;
  renamingPeblobIds: string[];
}