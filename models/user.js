export class User {
  constructor({
    idx,
    username,
    password,
    firstName,
    lastName,
    nickname,
    email,
    createdAt,
  }) {
    this._idx = idx;
    this._username = username;
    this._password = password;
    this._firstName = firstName;
    this._lastName = lastName;
    this._nickname = nickname;
    this._email = email;
    this._createdAt = createdAt;
  }

  get idx() {
    return this._idx;
  }
  set idx(input) {
    if (typeof input !== 'number' || input < 0) {
      throw new Error('invalid user idx');
    }

    this._idx = input;
  }

  get username() {
    return this._username;
  }
  set username(input) {
    const regex = /^[a-zA-Z0-9]{5,20}$/;
    if (typeof input !== 'string' || !regex.test(input)) {
      throw new Error('invalid username format');
    }

    this._username = input;
  }

  get password() {
    return this._password;
  }
  set password(input) {
    const regex = /^[ -~]{8,20}$/;
    if (typeof input !== 'string' || !regex.test(input)) {
      console.log(input);
      throw new Error('invalid password format');
    }

    this._password = input;
  }

  get firstName() {
    return this._firstName;
  }
  set firstName(input) {
    const regex = /^[a-zA-Z가-힣]{2,20}$/;
    if (typeof input !== 'string' || !regex.test(input)) {
      throw new Error('invalid first name format');
    }

    this._firstName = input;
  }

  get lastName() {
    return this._lastName;
  }
  set lastName(input) {
    const regex = /^[a-zA-Z가-힣]{2,20}$/;
    if (typeof input !== 'string' || !regex.test(input)) {
      throw new Error('invalid last name format');
    }

    this._lastName = input;
  }

  get nickname() {
    return this._nickname;
  }
  set nickname(input) {
    const regex = /^[a-zA-Z0-9]{2,20}$/;
    if (typeof input !== 'string' || !regex.test(input)) {
      throw new Error('invalid nickname format');
    }

    this._nickname = input;
  }

  get email() {
    return this._email;
  }
  set email(input) {
    if (typeof input !== 'string') {
      throw new Error('invalid email format');
    }

    const regex = new RegExp(
      '[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$',
    );
    const name = input.split('@')[0] ?? '';
    const domain = input.split('@')[1] ?? '';
    if (
      name.length === 0 ||
      name.length > 64 ||
      domain.length === 0 ||
      domain.length > 255 ||
      !regex.test(input)
    ) {
      throw new Error('invalid email format');
    }

    this._email = input;
  }

  get createdAt() {
    return this._createdAt;
  }
  set createdAt(input) {
    this._createdAt = input;
  }
}
