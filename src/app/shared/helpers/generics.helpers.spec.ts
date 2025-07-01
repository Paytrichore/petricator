import * as GenericsHelpers from './generics.helpers';

describe('generics.helpers', () => {
  it('capitalizeFirstLetter', () => {
    expect(GenericsHelpers.capitalizeFirstLetter('foo')).toBe('Foo');
    expect(GenericsHelpers.capitalizeFirstLetter('')).toBe('');
  });

  it('isString', () => {
    expect(GenericsHelpers.isString('a')).toBeTrue();
    expect(GenericsHelpers.isString(1)).toBeFalse();
    expect(GenericsHelpers.isString(null)).toBeFalse();
  });

  it('isStringArray', () => {
    expect(GenericsHelpers.isStringArray(['a', 'b'])).toBeTrue();
    expect(GenericsHelpers.isStringArray(['a', 1])).toBeFalse();
    expect(GenericsHelpers.isStringArray('a')).toBeFalse();
  });

  it('isEmptyValue', () => {
    expect(GenericsHelpers.isEmptyValue('')).toBeTrue();
    expect(GenericsHelpers.isEmptyValue(' ')).toBeTrue();
    expect(GenericsHelpers.isEmptyValue('a')).toBeFalse();
    expect(GenericsHelpers.isEmptyValue([])).toBeTrue();
    expect(GenericsHelpers.isEmptyValue([1])).toBeFalse();
    expect(GenericsHelpers.isEmptyValue({})).toBeTrue();
    expect(GenericsHelpers.isEmptyValue({ a: 1 })).toBeFalse();
    expect(GenericsHelpers.isEmptyValue(null)).toBeTrue();
    expect(GenericsHelpers.isEmptyValue(undefined)).toBeTrue();
    expect(GenericsHelpers.isEmptyValue(new File([], ''))).toBeFalse();
  });

  it('testBool', () => {
    expect(GenericsHelpers.testBool('true')).toBeTrue();
    expect(GenericsHelpers.testBool('false')).toBeFalse();
    expect(GenericsHelpers.testBool('other')).toBe('other');
    expect(GenericsHelpers.testBool(true)).toBe(true);
  });

  it('isBoolean', () => {
    expect(GenericsHelpers.isBoolean(true)).toBeTrue();
    expect(GenericsHelpers.isBoolean(false)).toBeTrue();
    expect(GenericsHelpers.isBoolean('true')).toBeFalse();
  });

  it('dateTree', () => {
    expect(typeof GenericsHelpers.dateTree()).toBe('string');
    expect(typeof GenericsHelpers.dateTree(new Date())).toBe('string');
  });

  it('strip', () => {
    expect(GenericsHelpers.strip('<b>foo</b>')).toBe('foo');
    expect(GenericsHelpers.strip('bar')).toBe('bar');
    expect(GenericsHelpers.strip('')).toBe('');
  });

  it('isSet', () => {
    expect(GenericsHelpers.isSet(null)).toBeFalse();
    expect(GenericsHelpers.isSet(undefined)).toBeFalse();
    expect(GenericsHelpers.isSet(0)).toBeTrue();
    expect(GenericsHelpers.isSet('')).toBeTrue();
  });
});
