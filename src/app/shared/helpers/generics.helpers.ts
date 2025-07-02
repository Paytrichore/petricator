import { isEmptyObject } from "./object.helpers";

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

export const strip = (html: string): string => {
  const tmp = document.implementation.createHTMLDocument('New').body;
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};
