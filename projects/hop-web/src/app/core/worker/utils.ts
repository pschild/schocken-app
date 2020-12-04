export const parseId = (idWithRev: string): string => {
  return idWithRev.split('::')[0];
};
