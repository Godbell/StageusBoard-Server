export const isNullish = (value) => {
  return value === null || value === undefined || value === '';
};

export const isValidEmail = (email) => {
  if (isNullish(email)) return false;

  const regex = new RegExp('[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$');
  const name = email.split('@')[0] ?? '';
  const domain = email.split('@')[1] ?? '';

  return (
    name.length > 0 &&
    name.length < 64 &&
    domain.length > 0 &&
    domain.length < 255 &&
    regex.test(email)
  );
};

export const isFormatOf = (
  str,
  {
    alphabet,
    koreanComplete,
    koreanIncomplete,
    number,
    lineEndings,
    printables,
    minLength = 0,
    maxLength = Infinity,
  },
) => {
  const regex = new RegExp(
    '^[' +
      (alphabet === true ? 'a-zA-Z' : '') +
      (number === true ? '0-9' : '') +
      (koreanComplete === true ? '가-힣' : '') +
      (koreanIncomplete === true ? 'ㅏ-ㅣ' : '') +
      (lineEndings === true ? '\\n\\r' : '') +
      (printables === true ? ' -~' : '') +
      ']+$',
  );

  return (
    !isNullish(str) &&
    str.length >= minLength &&
    str.length <= maxLength &&
    regex.test(str)
  );
};

export const isNumber = (number) => {
  return typeof number === 'number' && !isNaN(number);
};

export const isValidUuid = (string) => {
  if (isNullish(string) || typeof string !== 'string') return false;

  const regex = new RegExp(
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
  );

  return regex.test(string);
};
