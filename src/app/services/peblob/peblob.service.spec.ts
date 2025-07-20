import { PeblobService } from './peblob.service';
import { Tint } from '../../shared/interfaces/peblob';

describe('PeblobService', () => {
  let service: PeblobService;

  beforeEach(() => {
    service = new PeblobService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a composedPeblob for each tint', () => {
    Object.values(Tint).forEach(tint => {
      const composed = service.composedPeblobGenerator(tint);
      expect(composed.length).toBe(3);
      composed.forEach(line => {
        expect(line.length).toBe(3);
        line.forEach(peblob => {
          expect(peblob.r).toBeLessThanOrEqual(40);
          expect(peblob.g).toBeLessThanOrEqual(40);
          expect(peblob.b).toBeLessThanOrEqual(40);
        });
      });
    });
  });

  it('should generate different colors for different tints', () => {
    const orange = service.composedPeblobGenerator(Tint.ORANGE);
    const green = service.composedPeblobGenerator(Tint.GREEN);
    expect(JSON.stringify(orange)).not.toEqual(JSON.stringify(green));
  });

  it('should return base values for unknown tint (default case)', () => {
    // @ts-expect-error: purposely passing an invalid tint
    const result = service['makeColor']('UNKNOWN', 25);
    expect(result).toEqual({ r: 25, g: 25, b: 25 });
  });
});
