export const isNullish = (value) => {
  return value === null || value === undefined;
};

export const isEmptyString = (str) => {
  return str === '';
};

export const isLengthOf = (iterable, length) => {
  return iterable.length === length;
};

export const isValidEmail = (email) => {
  if (isNullish(email) || isEmptyString(email)) return false;

  const regex = new RegExp('[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$');
  const name = email.split('@')[0] ?? '';
  const domain = email.split('@')[1] ?? '';

  return isLengthOf(name, 64) && isLengthOf(domain, 255) && regex.test(email);
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
