import { ErrorStateMatcher } from '@angular/material/core';
import {
  AbstractControl,
  FormControl,
  ValidatorFn,
  FormGroupDirective,
  NgForm,
  FormArray,
} from '@angular/forms';
import { Optional } from '@angular/core';
import { isEmptyValue, strip } from '../generics.helpers';
import { of } from 'rxjs';


export const requiredValidator = (message: string): ValidatorFn => {
  return (control: AbstractControl) => {
    let val = control.value;

    if (typeof val === 'string') val = strip(val);

    if (val === '') {
      return {
        requiredValidator: message,
      };
    }

    return null;
  };
};


export const minMaxLengthValidator = (
  min: number,
  max: number,
  minMessage: string,
  maxMessage: string
): ValidatorFn => {
  return (control: AbstractControl) => {
    if (control.value && control.value.length < min) {
      return of({
        minLengthValidator: minMessage,
      });
    }
    if (control.value && control.value.length > max) {
      return {
        maxLengthValidator: maxMessage,
      };
    }
    return null;
  };
};

export const patternValidator = (
  pattern: string,
  message: string,
  exclude?: boolean
): ValidatorFn => {
  return (control: AbstractControl) => {
    if (control.value) {
      const regex = new RegExp(`${serializeApiPattern(pattern)}`);
      const value = control.value;

      if (typeof value === 'string') {
        if (!exclude && !regex.test(value)) {
          return {
            patternValidator: message,
          };
        }
      }
    }
    return null;
  };
};

export const countMinValidator = (minCount: number, minMessage: string): ValidatorFn => {
  return (control: AbstractControl) => {
    if (control instanceof FormArray) {
      if (control.controls.length < minCount) {
        return { countMinValidator: minMessage };
      }
    }

    return null;
  };
};

export const countMaxValidator = (maxCount: number, maxMessage: string): ValidatorFn => {
  return (control: AbstractControl) => {
    if (control instanceof FormArray) {
      if (control.controls.length > maxCount) {
        return of({ countMaxValidator: maxMessage });
      }
    }

    return null;
  };
};

export const urlValidator = (message: string): ValidatorFn => {
  const regex = new RegExp(/^(http|https):\/\//);
  return (control: AbstractControl) => {
    if (typeof control.value === 'string' && !regex.test(control.value)) {
      return { urlValidator: message };
    }

    return null;
  };
};

export const serializeApiPattern = (pattern: string): string => {
  const serializedPattern = pattern.substring(1, pattern.length - 1);

  return serializedPattern;
};

export class BasicInputStateMatcher implements ErrorStateMatcher {
  constructor(@Optional() private controlField: AbstractControl | null) {}
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(
      control &&
      form &&
      form.invalid &&
      this.controlField?.invalid &&
      (this.controlField?.touched || this.controlField?.dirty || form?.submitted)
    );
  }
}
