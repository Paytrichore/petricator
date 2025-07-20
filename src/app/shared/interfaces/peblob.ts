export interface Peblob {
  r: number;
  g: number;
  b: number;
}

export type ComposedPeblob = Array<Array<Peblob>>;

export enum Tint {
    ORANGE = 'orange',
    GREEN = 'green',
    BLUE = 'blue',
    PURPLE = 'purple',
    RED = 'red',
    YELLOW = 'yellow',
    PINK = 'pink',
}