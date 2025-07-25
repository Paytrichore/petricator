import { ComposedPeblob } from '../../../shared/interfaces/peblob';

export interface PeblobEntity {
  _id: string;
  userId: string;
  structure: ComposedPeblob;
  createdAt: Date;
  updatedAt: Date;
}

export interface PeblobState {
  peblobs: PeblobEntity[];
  loading: boolean;
  error: any;
}