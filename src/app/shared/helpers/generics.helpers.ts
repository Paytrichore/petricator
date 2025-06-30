import { isEmptyObject } from "./object.helpers";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const capitalizeFirstLetter = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const isString = (property: unknown): property is string => {
  return isSet(property) && typeof property === 'string';
};

export const isStringArray = (properties: unknown): properties is string[] => {
  return Array.isArray(properties) && properties.every(property => typeof property === 'string');
};

export const isEmptyValue = <T>(val: T): boolean => {
  if (val && typeof val === 'object') {
    if (val instanceof File) {
      return false;
    } else if (Array.isArray(val)) {
      return isEmptyValue(val[0]);
    } else {
      return isEmptyObject(val);
    }
  } else if (val && typeof val === 'string') {
    return !val.trim().length;
  } else {
    return !(val && val !== null);
  }
};

export const testBool = <T>(value: T): boolean | T => {
  const isTrue = isString(value) && value === 'true';
  const isFalse = isString(value) && value === 'false';

  if (isTrue) {
    return true;
  } else if (isFalse) {
    return false;
  } else {
    return value;
  }
};

export const isBoolean = (val: unknown): val is boolean => {
  return 'boolean' === typeof val;
};

export const dateTree = (date?: Date): string => {
  // Besoin de toLocalDateString pour avoir les jours et mois au format XX
  // Puis on inverse les données pour avoir la bonne arborescence
  return date
    ? date.toLocaleDateString().split('/').reverse().join('/')
    : new Date(Date.now()).toLocaleDateString().split('/').reverse().join('/');
};

export const strip = (html: string): string => {
  const tmp = document.implementation.createHTMLDocument('New').body;
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const isSet = (value: unknown): boolean => {
  return value !== undefined && value !== null;
};
