import { FormControl, FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { 
  requiredValidator, 
  minMaxLengthValidator, 
  patternValidator, 
  countMinValidator, 
  countMaxValidator, 
  urlValidator, 
  serializeApiPattern, 
  BasicInputStateMatcher 
} from './generics.validator';
import { of } from 'rxjs';

describe('generics.validators', () => {
  describe('requiredValidator', () => {
    it('should return error if value is empty string', () => {
      const validator = requiredValidator('Required!');
      const control = new FormControl('');
      expect(validator(control)).toEqual({ requiredValidator: 'Required!' });
    });
    it('should return null if value is not empty', () => {
      const validator = requiredValidator('Required!');
      const control = new FormControl('foo');
      expect(validator(control)).toBeNull();
    });
    it('should strip string and return error if only spaces', () => {
      const validator = requiredValidator('Required!');
      const control = new FormControl('   ');
      expect(validator(control)).toEqual({ requiredValidator: 'Required!' });
    });
  });

  describe('minMaxLengthValidator', () => {
    it('should return observable error if value is too short', (done) => {
      const validator = minMaxLengthValidator(3, 5, 'Too short', 'Too long');
      const control = new FormControl('ab');
      const result = validator(control);
      if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((err: any) => {
          expect(err).toEqual({ minLengthValidator: 'Too short' });
          done();
        });
      } else {
        fail('Expected observable');
        done();
      }
    });
    it('should return error if value is too long', () => {
      const validator = minMaxLengthValidator(2, 4, 'Too short', 'Too long');
      const control = new FormControl('abcde');
      expect(validator(control)).toEqual({ maxLengthValidator: 'Too long' });
    });
    it('should return null if value is in range', () => {
      const validator = minMaxLengthValidator(2, 4, 'Too short', 'Too long');
      const control = new FormControl('abc');
      expect(validator(control)).toBeNull();
    });
    it('should return null if value is falsy', () => {
      const validator = minMaxLengthValidator(2, 4, 'Too short', 'Too long');
      const control = new FormControl(null);
      expect(validator(control)).toBeNull();
    });
  });

  describe('patternValidator', () => {
    it('should return error if value does not match pattern', () => {
      const validator = patternValidator('/^foo$/', 'Pattern!');
      const control = new FormControl('bar');
      expect(validator(control)).toEqual({ patternValidator: 'Pattern!' });
    });
    it('should return null if value matches pattern', () => {
      const validator = patternValidator('/^foo$/', 'Pattern!');
      const control = new FormControl('foo');
      expect(validator(control)).toBeNull();
    });
    it('should return null if value is falsy', () => {
      const validator = patternValidator('/^foo$/', 'Pattern!');
      const control = new FormControl(null);
      expect(validator(control)).toBeNull();
    });
    it('should return null if exclude is true', () => {
      const validator = patternValidator('/^foo$/', 'Pattern!', true);
      const control = new FormControl('bar');
      expect(validator(control)).toBeNull();
    });
  });

  describe('countMinValidator', () => {
    it('should return error if FormArray has less than min', () => {
      const validator = countMinValidator(2, 'Too few');
      const arr = new FormArray([new FormControl('a')]);
      expect(validator(arr)).toEqual({ countMinValidator: 'Too few' });
    });
    it('should return null if FormArray has enough', () => {
      const validator = countMinValidator(2, 'Too few');
      const arr = new FormArray([new FormControl('a'), new FormControl('b')]);
      expect(validator(arr)).toBeNull();
    });
    it('should return null if not a FormArray', () => {
      const validator = countMinValidator(2, 'Too few');
      const control = new FormControl('a');
      expect(validator(control)).toBeNull();
    });
  });

  describe('countMaxValidator', () => {
    it('should return observable error if FormArray has more than max', (done) => {
      const validator = countMaxValidator(1, 'Too many');
      const arr = new FormArray([new FormControl('a'), new FormControl('b')]);
      const result = validator(arr);
      if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((err: any) => {
          expect(err).toEqual({ countMaxValidator: 'Too many' });
          done();
        });
      } else {
        fail('Expected observable');
        done();
      }
    });
    it('should return null if FormArray has not more than max', () => {
      const validator = countMaxValidator(2, 'Too many');
      const arr = new FormArray([new FormControl('a'), new FormControl('b')]);
      expect(validator(arr)).toBeNull();
    });
    it('should return null if not a FormArray', () => {
      const validator = countMaxValidator(1, 'Too many');
      const control = new FormControl('a');
      expect(validator(control)).toBeNull();
    });
  });

  describe('urlValidator', () => {
    it('should return error if value is not a valid url', () => {
      const validator = urlValidator('Invalid URL');
      const control = new FormControl('ftp://foo');
      expect(validator(control)).toEqual({ urlValidator: 'Invalid URL' });
    });
    it('should return null if value is a valid url', () => {
      const validator = urlValidator('Invalid URL');
      const control = new FormControl('https://foo');
      expect(validator(control)).toBeNull();
    });
    it('should return null if value is not a string', () => {
      const validator = urlValidator('Invalid URL');
      const control = new FormControl(123);
      expect(validator(control)).toBeNull();
    });
  });

  describe('serializeApiPattern', () => {
    it('should strip first and last char', () => {
      expect(serializeApiPattern('/abc/')).toBe('abc');
    });
    it('should work with empty string', () => {
      expect(serializeApiPattern('')).toBe('');
    });
  });

  describe('BasicInputStateMatcher', () => {
    it('should return true if all error state conditions are met', () => {
      const control = new FormControl('');
      control.markAsTouched();
      control.setErrors({ error: true });
      const form = { invalid: true, submitted: false } as any;
      const matcher = new BasicInputStateMatcher(control);
      expect(matcher.isErrorState(control, form)).toBe(true);
    });
    it('should return false if control is valid', () => {
      const control = new FormControl('foo');
      const form = { invalid: false, submitted: false } as any;
      const matcher = new BasicInputStateMatcher(control);
      expect(matcher.isErrorState(control, form)).toBe(false);
    });
    it('should return false if form is null', () => {
      const control = new FormControl('foo');
      const matcher = new BasicInputStateMatcher(control);
      expect(matcher.isErrorState(control, null)).toBe(false);
    });
  });
});
