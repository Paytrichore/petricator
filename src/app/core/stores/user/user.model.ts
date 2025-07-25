import { ComposedPeblob } from "../../../shared/interfaces/peblob";

export interface User {
  _id: string;
  username: string;
  email: string;
  peblobs: string[];
}
