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

export const tintMap: Record<string, Tint> = {
    orange: Tint.ORANGE,
    green: Tint.GREEN,
    blue: Tint.BLUE,
    purple: Tint.PURPLE,
    red: Tint.RED,
    yellow: Tint.YELLOW,
    pink: Tint.PINK,
    rose: Tint.PINK,
    neutral: Tint.GREEN,
    violet: Tint.PURPLE
};