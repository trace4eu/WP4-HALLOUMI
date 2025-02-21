export const flattenObject = (
  obj: { [s: string]: unknown } | ArrayLike<unknown> | object,
  parentKey = ''
) => {
  return Object.entries(obj).flatMap(([key, value]): any => {
    const itemKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      return flattenObject(value, itemKey);
    } else {
      return [{ itemKey, value }];
    }
  });
};
