import {
  applyRGBEffect,
  applyRGBEffectToStructure,
  calculatePeblobMetrics,
  deriveStoryEffect,
  getChoiceCompatibility,
} from './peblob-progression';
import { Tint } from '../interfaces/peblob';

describe('peblob progression helpers', () => {
  it('clamps positive and negative RGB effects without mutating the source', () => {
    const color = { r: 250, g: 5, b: 100 };

    expect(applyRGBEffect(color, { r: 10, g: -20, b: 3 })).toEqual({ r: 255, g: 0, b: 103 });
    expect(color).toEqual({ r: 250, g: 5, b: 100 });
  });

  it('applies an effect immutably to every pixel', () => {
    const structure = [[{ r: 1, g: 2, b: 3 }]];

    expect(applyRGBEffectToStructure(structure, { r: 2, g: 3, b: 4 })).toEqual([[
      { r: 3, g: 5, b: 7 },
    ]]);
    expect(structure).toEqual([[{ r: 1, g: 2, b: 3 }]]);
  });

  it('calculates distinct maturity and balance metrics', () => {
    expect(calculatePeblobMetrics([[{ r: 200, g: 200, b: 200 }]])).toEqual({ maturity: jasmine.any(Number), balance: 1 });
    expect(calculatePeblobMetrics([[{ r: 240, g: 40, b: 40 }]]).balance).toBeLessThan(1);
  });

  it('classifies aligned and distant choices', () => {
    expect(getChoiceCompatibility(Tint.RED, Tint.RED)).toBe('aligned');
    expect(getChoiceCompatibility(Tint.RED, Tint.YELLOW)).toBe('compatible');
    expect(getChoiceCompatibility(Tint.RED, Tint.BLUE)).toBe('tension');
  });

  it('redistributes tension effects instead of applying a uniform penalty', () => {
    expect(deriveStoryEffect(Tint.RED, Tint.BLUE, 12)).toEqual({ r: -21, g: -21, b: 84 });
    expect(deriveStoryEffect(Tint.RED, Tint.GREEN, 12)).toEqual({ r: -21, g: 84, b: -21 });
    expect(deriveStoryEffect(Tint.GREEN, Tint.RED, 12)).toEqual({ r: 84, g: -21, b: -21 });
  });

  it('increases story effect intensity as the adventure progresses', () => {
    const firstStory = deriveStoryEffect(Tint.RED, Tint.BLUE, 1);
    const lastStory = deriveStoryEffect(Tint.RED, Tint.BLUE, 12);

    expect(Math.abs(lastStory.b)).toBeGreaterThan(Math.abs(firstStory.b));
    expect(Math.abs(lastStory.r)).toBeGreaterThan(Math.abs(firstStory.r));
  });
});