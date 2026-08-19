import { ComposedPeblob } from '../../../shared/interfaces/peblob';

export interface PeblobEntity {
  _id: string;
  userId: string;
  structure: ComposedPeblob;
  createdAt: Date;
  updatedAt: Date;
  ownerName?: string;
}

export interface PeblobState {
  peblobs: PeblobEntity[];
  mapPeblobs: PeblobEntity[];
  loading: boolean;
  mapLoading: boolean;
  error: any;
}