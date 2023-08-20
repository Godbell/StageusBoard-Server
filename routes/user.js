import express from 'express';
import { isFormatOf, isNullish, isValidEmail } from '../utils/validation.js';

const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  if (!isNullish(req.session.userIdx)) {
    res.sendStatus(401);
    return;
  }

  const result = true;
  console.log('get user');

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

userRouter.get('/find-username', (req, res) => {
  const email = req.body.email;
  if (!isValidEmail(email)) {
    res.sendStatus(400);
    return;
  }

  const result = true;
  console.log('find username');

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

userRouter.put('/reset-password', (req, res) => {
  if (!isNullish(req.session.resetPwUserIdx)) {
    res.sendStatus(401);
    return;
  }

  const password = req.body.password;
  if (!isFormatOf(password, { printables: true })) {
    res.sendStatus(400);
    return;
  }

  const result = true;
  console.log('reset password');

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

userRouter.put('/', (req, res) => {
  if (!isNullish(req.session.userIdx)) {
    res.sendStatus(401);
    return;
  }

  const password = req.body.password;
  const isPasswordValid = isFormatOf(password, { printables: true });

  const nickname = req.body.nickname;
  const isNicknameValid =
    isFormatOf(nickname, {
      alphabet: true,
      koreanComplete: true,
      number: true,
    }) && nickname.length <= 45;

  const firstName = req.body.firstName;
  const isFirstNameValid =
    isFormatOf(firstName, { alphabet: true, koreanComplete: true }) &&
    2 <= firstName.length &&
    firstName.length <= 20;

  const lastName = req.body.lastName;
  const isLastNameValid =
    isFormatOf(lastName, { alphabet: true, koreanComplete: true }) &&
    2 <= lastName.length &&
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

  const result = true;
  console.log('edit user');

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

userRouter.delete('/', (req, res) => {
  if (!isNullish(req.session.userIdx)) {
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

userRouter.post('/', (req, res) => {
  const result = true;
  console.log('add user');

  const password = req.body.password;
  const isPasswordValid = isFormatOf(password, { printables: true });

  const nickname = req.body.nickname;
  const isNicknameValid =
    isFormatOf(nickname, {
      alphabet: true,
      koreanComplete: true,
      number: true,
    }) && nickname.length <= 45;

  const firstName = req.body.firstName;
  const isFirstNameValid =
    isFormatOf(firstName, { alphabet: true, koreanComplete: true }) &&
    2 <= firstName.length &&
    firstName.length <= 20;

  const lastName = req.body.lastName;
  const isLastNameValid =
    isFormatOf(lastName, { alphabet: true, koreanComplete: true }) &&
    2 <= lastName.length &&
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

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

userRouter.post('/signin', (req, res) => {
  const result = true;
  console.log('login');

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

userRouter.post('/signout', (req, res) => {
  if (!isNullish(req.session.userIdx)) {
    res.sendStatus(400);
    return;
  }

  req.session.destroy((err) => {
    res.sendStatus(400);
  });
});

export default userRouter;
