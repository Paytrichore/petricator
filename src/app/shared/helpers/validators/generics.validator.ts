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

    if (isEmptyValue(val)) {
      return {
        requiredValidator: message,
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
