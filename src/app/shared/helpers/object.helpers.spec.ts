import { isEmptyObject } from './object.helpers';

describe('isEmptyObject', () => {
  it('should return true for an empty object', () => {
    expect(isEmptyObject({})).toBeTrue();
  });

  it('should return false for an object with properties', () => {
    expect(isEmptyObject({ a: 1 })).toBeFalse();
    expect(isEmptyObject({ foo: 'bar' })).toBeFalse();
  });

  it('should return true for an object created with Object.create(null)', () => {
    expect(isEmptyObject(Object.create(null))).toBeTrue();
  });

  it('should return false for an array with elements', () => {
    expect(isEmptyObject([1, 2, 3])).toBeFalse();
  });

  it('should return true for an empty array', () => {
    expect(isEmptyObject([])).toBeTrue();
  });

  it('should return true for a function with no properties', () => {
    function f() {}
    expect(isEmptyObject(f)).toBeTrue();
  });

  it('should return false for a function with properties', () => {
    function f() {}
    (f as any).foo = 'bar';
    expect(isEmptyObject(f)).toBeFalse();
  });
});
