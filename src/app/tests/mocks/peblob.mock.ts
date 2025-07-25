import { PeblobEntity, PeblobState } from "../../core/stores/peblob/peblob.model";
import { ComposedPeblob } from "../../shared/interfaces/peblob";

export const mockPeblob: PeblobEntity = {
  _id: 'p1',
  userId: 'u1',
  structure: [[{ r: 1, g: 2, b: 3 }]],
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockPeblobs: ComposedPeblob[] = [
    [[{ r: 1, g: 2, b: 3 }]],
    [[{ r: 4, g: 5, b: 6 }]]
  ];

export const initialState: PeblobState = {
  peblobs: [mockPeblob],
  loading: false,
  error: null
};