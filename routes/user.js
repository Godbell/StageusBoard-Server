import express from 'express';
import { isFormatOf, isNullish, isValidEmail } from '../utils/validation.js';
import asyncify from 'express-asyncify';
import pgPool from '../utils/pgPool.js';

const userRouter = asyncify(express.Router());

userRouter.get('/', async (req, res) => {
  const userIdx = req.session.userIdx;
  if (isNullish(userIdx)) {
    res.sendStatus(401);
    return;
  }

  const connection = await pgPool.connect();
  const query =
    'SELECT idx, username, first_name, last_name, nickname, created_at, email' +
    ' FROM backend.user' +
    ' WHERE id=$1;';
  const user = await connection.query(query, [userIdx]);
  connection.release();

  res.json(backend.user);
});

userRouter.get('/find-username', async (req, res) => {
  const email = req.body.email;
  if (!isValidEmail(email)) {
    res.sendStatus(400);
    return;
  }

  const connection = await pgPool.connect();
  const query = 'SELECT username FROM backend.user WHERE email=$1;';
  const username = await connection.query(query, [email]);
  connection.release();

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

  const connection = await pgPool.connect();
  const query = 'SELECT id FROM backend.user WHERE email=?';
  const userIdx = await connection.query(query, [email]);
  connection.release();

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

  const connection = await pgPool.connect();
  const query = 'UPDATE backend.user SET password=$1 WHERE id=$2';
  await connection.query(query, [password, userIdx]);
  connection.release();

  req.session.destroy((err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
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

  let query = null;
  const values = [];

  const connection = await pgPool.connect();
  if (isNullish(password)) {
    query =
      'UPDATE backend.user SET nickname=$1, firstname=$2, lastname=$3, email=$4 WHERE id=$4';
    values = [nickname, firstName, lastName, email, userIdx];
  } else {
    query =
      'UPDATE backend.user SET nickname=$1, firstname=$2, lastname=$3, email=$4 password=$5' +
      ' WHERE id=$6';
    values = [nickname, firstName, lastName, email, password, userIdx];
  }

  await connection.query(query, values);
  connection.release();

  res.sendStatus(200);
});

userRouter.delete('/', (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  const result = true;

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

  const connection = await pgPool.connect();

  const query =
    'INSERT INTO USER (nickname, firstname, lastname, email, password)' +
    ' VALUES ($1, $2, $3, $4, $5);';

  await connection.query(query, [
    nickname,
    firstName,
    lastName,
    email,
    password,
  ]);
  connection.release();

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

  const query = 'SELECT COUNT(*) AS count FROM backend.user WHERE username=$1';
  const connection = await pgPool.connect();
  const count = await connection.query(query, username);

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

  const connection = await pgPool.connect();
  const query = 'SELECT COUNT(*) AS count FROM backend.user WHERE email=$1';
  const count = await connection.query(query, email);
  connection.release();

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

  const connection = await pgPool.connect();
  const query =
    'SELECT idx FROM backend.user WHERE username=$1 AND password=$2;';
  const userIdx = await connection.query(query, [username, password]);
  connection.release();

  req.session.userIdx = userIdx[0].idx;
  res.sendStatus(200);
});

userRouter.get('/signout', (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

export default userRouter;
