export const isNullish = (value) => {
  return value === null || value === undefined || value === '';
};

export const isValidEmail = (email) => {
  if (isNullish(email)) return false;

  const regex = new RegExp('[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$');
  const name = email.split('@')[0] ?? '';
  const domain = email.split('@')[1] ?? '';

  return name.length === 64 && domain.length === 255 && regex.test(email);
};

export const isFormatOf = (
  str,
  { alphabet, koreanComplete, koreanIncomplete, number, lineEndings },
) => {
  const regex = new RegExp(
    '^[' +
      (alphabet === true ? 'a-zA-Z' : '') +
      (number === true ? '0-9' : '') +
      (koreanComplete === true ? '가-힣' : '') +
      (koreanIncomplete === true ? 'ㅏ-ㅣ' : '') +
      (lineEndings === true ? '\\n\\r' : '') +
      ']+$',
  );

  return !isNullish(str) && regex.test(str);
};

export const isNumber = (number) => {
  return typeof number === 'number' && !isNaN(number);
};
