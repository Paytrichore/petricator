export const isEmptyObject = <T>(obj: T): boolean => {
  return Object.keys(obj as any).length === 0 ? true : false;
};
