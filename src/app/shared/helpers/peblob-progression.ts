import { ComposedPeblob, Peblob, PeblobMetrics, RGBEffect, Tint } from '../interfaces/peblob';

export type PeblobChoiceCompatibility = 'aligned' | 'compatible' | 'tension';

const MAX_RGB = 255;

const chromaticVectors: Record<Tint, Peblob> = {
  [Tint.RED]: { r: 1, g: 0.25, b: 0.25 },
  [Tint.GREEN]: { r: 0.25, g: 1, b: 0.25 },
  [Tint.BLUE]: { r: 0.25, g: 0.25, b: 1 },
  [Tint.YELLOW]: { r: 1, g: 1, b: 0 },
  [Tint.PURPLE]: { r: 1, g: 0, b: 1 },
  [Tint.ORANGE]: { r: 1, g: 0.5, b: 0 },
  [Tint.PINK]: { r: 1, g: 0.4, b: 0.7 },
};

export function clampRgb(value: number): number {
  return Math.max(0, Math.min(MAX_RGB, value));
}

export function applyRGBEffect(color: Peblob, effect: RGBEffect): Peblob {
  return {
    r: clampRgb(color.r + effect.r),
    g: clampRgb(color.g + effect.g),
    b: clampRgb(color.b + effect.b),
  };
}

export function applyRGBEffectToStructure(structure: ComposedPeblob, effect: RGBEffect): ComposedPeblob {
  return structure.map(row => row.map(color => applyRGBEffect(color, effect)));
}

export function calculatePeblobMetrics(structure: ComposedPeblob): PeblobMetrics {
  const colors = structure.flat();
  if (!colors.length) {
    return { maturity: 0, balance: 0 };
  }

  const channelTotal = colors.reduce((total, color) => total + color.r + color.g + color.b, 0);
  const maturity = channelTotal / (colors.length * MAX_RGB * 3);
  const balanceTotal = colors.reduce((total, color) => {
    const channels = [color.r, color.g, color.b];
    return total + 1 - (Math.max(...channels) - Math.min(...channels)) / MAX_RGB;
  }, 0);

  return {
    maturity,
    balance: balanceTotal / colors.length,
  };
}

export function getChoiceCompatibility(dominantColor: Tint, choiceColor: Tint): PeblobChoiceCompatibility {
  if (dominantColor === choiceColor) {
    return 'aligned';
  }

  const dominantVector = chromaticVectors[dominantColor];
  const choiceVector = chromaticVectors[choiceColor];
  const distance = Math.sqrt(
    (dominantVector.r - choiceVector.r) ** 2
      + (dominantVector.g - choiceVector.g) ** 2
      + (dominantVector.b - choiceVector.b) ** 2
  );

  return distance >= 1 ? 'tension' : 'compatible';
}

export function deriveStoryEffect(dominantColor: Tint, choiceColor: Tint, storyNumber = 1): RGBEffect {
  const vector = chromaticVectors[choiceColor];
  const compatibility = getChoiceCompatibility(dominantColor, choiceColor);

  const boundedStoryNumber = Math.max(1, Math.min(12, storyNumber));
  const intensity = 9 + boundedStoryNumber;

  if (compatibility === 'tension') {
    const channels: Array<keyof RGBEffect> = ['r', 'g', 'b'];
    const positiveChannel = channels.reduce((bestChannel, channel) =>
      vector[channel] > vector[bestChannel] ? channel : bestChannel
    );

    return {
      r: positiveChannel === 'r' ? intensity * 4 : -intensity,
      g: positiveChannel === 'g' ? intensity * 4 : -intensity,
      b: positiveChannel === 'b' ? intensity * 4 : -intensity,
    };
  }

  const compatibleIntensity = intensity;

  return {
    r: Math.round(vector.r * compatibleIntensity),
    g: Math.round(vector.g * compatibleIntensity),
    b: Math.round(vector.b * compatibleIntensity),
  };
}