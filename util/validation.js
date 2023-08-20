export const isNullish = (value) => {
  return value === null || value === undefined;
};

export const isEmptyString = (str) => {
  return str === '';
};

export const isLengthOf = (iterable, length) => {
  return iterable.length === length;
};

export const isStringOfFormat = (
  str,
  { alphabet, korean, number, lineEndings },
) => {
  const regex = new RegExp(
    '^[' +
      (alphabet === true ? 'a-zA-Z' : '') +
      (number === true ? '0-9' : '') +
      (korean === true ? '가-힣' : '') +
      (lineEndings === true ? '\\n\\r' : '') +
      ']+$',
  );

  return regex.test(str);
};

export const isNumber = (number) => {
  return typeof number === 'number' && !isNaN(number);
};
