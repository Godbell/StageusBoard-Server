import express from 'express';
import { isFormatOf, isNullish, isValidEmail } from '../utils/validation.js';
import asyncify from 'express-asyncify';
import mariadbPool from '../utils/mariadbPool.js';

const userRouter = asyncify(express.Router());

userRouter.get('/', async (req, res) => {
  const userIdx = req.session.userIdx;
  if (isNullish(userIdx)) {
    res.sendStatus(401);
    return;
  }

  const query =
    'SELECT id as idx, username, first_name, last_name, nickname, created_at, email' +
    ' FROM user' +
    ' WHERE id=?;';
  const user = await mariadbPool.query(query, [userIdx]);

  res.json(user);
});

userRouter.get('/find-username', async (req, res) => {
  const email = req.body.email;
  if (!isValidEmail(email)) {
    res.sendStatus(400);
    return;
  }

  const query = 'SELECT username FROM user WHERE email=?;';
  const username = await mariadbPool.query(query, [email]);

  if (username.length === 0) {
    res.sendStatus(404);
  } else {
    res.json(username);
  }
});

userRouter.get('/reset-password/authenicate', async (req, res) => {
  const email = req.query.email;
  if (!isValidEmail(email)) {
    res.sendStatus(400);
    return;
  }

  const query = 'SELECT id FROM user WHERE email=?';
  const userIdx = await mariadbPool.query(query, [email]);

  if (userIdx.length === 0) {
    res.sendStatus(404);
  } else {
    req.session.pwResetUserIdx = userIdx[0];
  }
});

userRouter.put('/reset-password', async (req, res) => {
  const userIdx = req.session.pwResetUserIdx;
  if (isNullish(userIdx)) {
    res.sendStatus(401);
    return;
  }

  const password = req.body.password;
  if (!isFormatOf(password, { printables: true }) || password.length > 20) {
    res.sendStatus(400);
    return;
  }

  const query = 'UPDATE user SET password=? WHERE id=?';
  await mariadbPool.query(query, [password, userIdx]);

  req.session.destroy();
  res.sendStatus(200);
});

userRouter.put('/', async (req, res) => {
  const userIdx = req.session.userIdx;
  if (isNullish(userIdx)) {
    res.sendStatus(401);
    return;
  }

  const password = req.body.password;
  const isPasswordValid =
    isFormatOf(password, { printables: true }) &&
    password.length >= 8 &&
    password.length <= 20;

  const nickname = req.body.nickname;
  const isNicknameValid =
    isFormatOf(nickname, {
      alphabet: true,
      koreanComplete: true,
      number: true,
    }) &&
    nickname.length >= 2 &&
    nickname.length <= 45;

  const firstName = req.body.firstName;
  const isFirstNameValid =
    isFormatOf(firstName, { alphabet: true, koreanComplete: true }) &&
    2 <= firstName.length &&
    firstName.length >= 1 &&
    firstName.length <= 20;

  const lastName = req.body.lastName;
  const isLastNameValid =
    isFormatOf(lastName, { alphabet: true, koreanComplete: true }) &&
    2 <= lastName.length &&
    lastName.length >= 1 &&
    lastName.length <= 20;

  const email = req.body.email;
  const isEmailValid = isValidEmail(email);

  if (
    (!isNullish(password) && !isPasswordValid) ||
    !isNicknameValid ||
    !isFirstNameValid ||
    !isLastNameValid ||
    !isEmailValid
  ) {
    res.sendStatus(400);
    return;
  }

  const query =
    'UPDATE user SET nickname=?, firstname=?, lastname=?, email=?' +
    (isNullish(password) ? '' : ' password=?') +
    ' WHERE id=?';

  const values = [];
  values.push(nickname, firstName, lastName, email);
  if (isNullish(password)) {
    values.push(password);
  }
  values.push(userIdx);

  await mariadbPool.query(query, values);

  res.sendStatus(200);
});

userRouter.delete('/', (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  const result = true;
  console.log('delete user');

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

userRouter.post('/', async (req, res) => {
  const password = req.body.password;
  const isPasswordValid =
    isFormatOf(password, { printables: true }) &&
    password.length >= 8 &&
    password.length <= 20;

  const username = req.body.username;
  const isUsernameValid =
    isFormatOf(username, {
      alphabet: true,
      number: true,
    }) &&
    username.length >= 8 &&
    username.length <= 20;

  const nickname = req.body.nickname;
  const isNicknameValid =
    isFormatOf(nickname, {
      alphabet: true,
      koreanComplete: true,
      number: true,
    }) &&
    nickname.length >= 2 &&
    nickname.length <= 45;

  const firstName = req.body.firstName;
  const isFirstNameValid =
    isFormatOf(firstName, { alphabet: true, koreanComplete: true }) &&
    2 <= firstName.length &&
    firstName.length >= 1 &&
    firstName.length <= 20;

  const lastName = req.body.lastName;
  const isLastNameValid =
    isFormatOf(lastName, { alphabet: true, koreanComplete: true }) &&
    2 <= lastName.length &&
    lastName.length >= 1 &&
    lastName.length <= 20;

  const email = req.body.email;
  const isEmailValid = isValidEmail(email);

  if (
    !isUsernameValid ||
    !isPasswordValid ||
    !isNicknameValid ||
    !isFirstNameValid ||
    !isLastNameValid ||
    !isEmailValid
  ) {
    res.sendStatus(400);
    return;
  }

  if (emailCount[0].count !== 0) {
    res.sendStatus(400);
    return;
  }

  const query =
    'INSERT INTO USER (nickname, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?);';

  await mariadbPool.query(query, [
    nickname,
    firstName,
    lastName,
    email,
    password,
  ]);

  res.sendStatus(200);
});

userRouter.get('/username-available', async (req, res) => {
  const username = req.query.username;
  const isUsernameValid =
    isFormatOf(username, {
      alphabet: true,
      number: true,
    }) &&
    username.length >= 8 &&
    username.length <= 20;

  if (!isUsernameValid) {
    res.sendStatus(400);
    return;
  }

  const query = 'SELECT COUNT(*) AS count FROM user WHERE username=?';
  const count = await mariadbPool.query(query, username);

  if (count[0].count === 0) {
    res.json({
      availability: true,
    });
  } else {
    res.json({
      availability: false,
    });
  }
});

userRouter.get('/email-available', async (req, res) => {
  const email = req.query.email;
  const isEmailValid = isValidEmail(email);

  if (!isEmailValid) {
    res.sendStatus(400);
    return;
  }

  const query = 'SELECT COUNT(*) AS count FROM user WHERE email=?';
  const count = await mariadbPool.query(query, email);

  if (count[0].count === 0) {
    res.json({
      availability: true,
    });
  } else {
    res.json({
      availability: false,
    });
  }
});

userRouter.post('/signin', async (req, res) => {
  const username = req.body.username;
  const isUsernameValid = isFormatOf(username, {
    alphabet: true,
    number: true,
  });

  const password = req.body.password;
  const isPasswordValid =
    isFormatOf(password, { printables: true }) &&
    password.length >= 8 &&
    password.length <= 20;

  if (!isUsernameValid || !isPasswordValid) {
    res.sendStatus(400);
    return;
  }

  const query = 'SELECT id AS idx FROM user WHERE username=? AND password=?;';
  const userIdx = await mariadbPool.query(query, [username, password]);

  req.session.userIdx = userIdx[0].idx;
});

userRouter.post('/signout', (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  req.session.destroy((err) => {
    res.sendStatus(400);
  });
});

export default userRouter;
