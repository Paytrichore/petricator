import { Injectable } from '@angular/core';
import { ComposedPeblob, Peblob, Tint } from '../../shared/interfaces/peblob';

@Injectable({
  providedIn: 'root',
})
export class PeblobService {
  constructor() {}

  public composedPeblobGenerator(tint?: Tint): ComposedPeblob {
    if (!tint) {
      const rand = Math.random();
      if (rand < 0.75) {
        // 75% : yellow, red, blue
        const mainTints = [Tint.YELLOW, Tint.RED, Tint.BLUE];
        tint = mainTints[Math.floor(Math.random() * mainTints.length)];
      } else if (rand < 0.95) {
        // 20% : violet, green, orange
        const secondaryTints = [Tint.PURPLE, Tint.GREEN, Tint.ORANGE];
        tint = secondaryTints[Math.floor(Math.random() * secondaryTints.length)];
      } else {
        // 5% : pink
        tint = Tint.PINK;
      }
    }

    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const composed: ComposedPeblob = [
      [
        this.makeColor(tint, rand(20, 40)),
        this.makeColor(tint, rand(10, 40)),
        this.makeColor(tint, rand(0, 40))
      ],
      [
        this.makeColor(tint, rand(10, 40)),
        this.makeColor(tint, rand(0, 40)),
        this.makeColor(tint, rand(0, 40))
      ],
      [
        this.makeColor(tint, rand(10, 40)),
        this.makeColor(tint, rand(0, 40)),
        this.makeColor(tint, rand(0, 40))
      ]
    ];

    return composed;
  }

  // Helper pour générer une couleur dans la teinte
  private makeColor(tint: Tint, base: number): Peblob {
    const percent = (val: number, min: number, max: number) => Math.floor(val * (min + Math.random() * (max - min)));
    const low = () => Math.floor(Math.random() * 6);

    switch (tint) {
      case Tint.ORANGE:
        return { r: base, g: percent(base, 0.3, 0.6), b: low() };
      case Tint.PURPLE:
        return { r: base, g: percent(base, 0.2, 0.4), b: base };
      case Tint.PINK:
        return { r: base, g: percent(base, 0.2, 0.4), b: percent(base, 0.5, 0.8) };
      case Tint.YELLOW:
        return { r: base, g: percent(base, 0.8, 1), b: low() };
      case Tint.GREEN:
        return { r: percent(base, 0.2, 0.4), g: base, b: percent(base, 0.2, 0.4) };
      case Tint.BLUE:
        return { r: percent(base, 0.2, 0.4), g: percent(base, 0.2, 0.4), b: base };
      case Tint.RED:
        return { r: base, g: percent(base, 0.2, 0.4), b: percent(base, 0.2, 0.4) };
      default:
        return { r: base, g: base, b: base };
    }
  }
}
