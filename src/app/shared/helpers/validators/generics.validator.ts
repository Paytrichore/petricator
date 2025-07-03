import { ErrorStateMatcher } from '@angular/material/core';
import {
  AbstractControl,
  FormControl,
  ValidatorFn,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { Optional } from '@angular/core';
import { isEmptyValue, strip } from '../generics.helpers';


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

export const passwordStrengthValidator = (): ValidatorFn => {
  return (control: AbstractControl) => {
    const value = control.value;
    if (typeof value !== 'string' || !value) return null;
    const errors: any = {};
    if (value.length < 6) {
      errors.minLength = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
      errors.specialChar = 'Le mot de passe doit contenir au moins un caractère spécial';
    }
    if (!/[0-9]/.test(value)) {
      errors.digit = 'Le mot de passe doit contenir au moins un chiffre';
    }
    if (!/[A-Z]/.test(value)) {
      errors.uppercase = 'Le mot de passe doit contenir au moins une majuscule';
    }
    return Object.keys(errors).length ? { passwordStrength: { ...errors } } : null;
  };
};

export const matchOtherControlValidator = (otherControlName: string, message: string): ValidatorFn => {
  return (control: AbstractControl) => {
    if (!control.parent) return null;
    const otherControl = control.parent.get(otherControlName);
    if (!otherControl) return null;
    if (control.value !== otherControl.value) {
      return { matchOtherControl: message };
    }
    return null;
  };
};
