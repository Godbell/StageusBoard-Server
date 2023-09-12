import express from 'express';
import { isFormatOf, isNullish, isValidEmail } from '../utils/validation.js';
import asyncify from 'express-asyncify';
import pgQuery from '../utils/pgPool.js';

const userRouter = asyncify(express.Router());

userRouter.get('/', async (req, res) => {
  const userIdx = req.session.userIdx;
  if (isNullish(userIdx)) {
    res.sendStatus(401);
    return;
  }

  const query =
    "SELECT idx, username, first_name, last_name, nickname, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at, email" +
    ' FROM backend.user' +
    ' WHERE idx=$1 AND is_deleted=FALSE;';
  const user = (await pgQuery(query, [userIdx])).rows[0];

  if (!user) {
    res.sendStatus(404);
    return;
  }

  res.json(user);
});

userRouter.get('/find-username', async (req, res) => {
  const email = req.query.email;
  if (!isValidEmail(email)) {
    res.sendStatus(400);
    return;
  }

  const query = 'SELECT username FROM backend.user WHERE email=$1;';
  const username = (await pgQuery(query, [email])).rows;

  if (username.length === 0) {
    res.sendStatus(404);
  } else {
    res.send(username[0].username);
  }
});

userRouter.get('/password/authenticate', async (req, res) => {
  const email = req.query.email;
  if (!isValidEmail(email)) {
    res.sendStatus(400);
    return;
  }

  const query = 'SELECT idx FROM backend.user WHERE email=$1';
  const userIdx = (await pgQuery(query, [email])).rows;

  if (userIdx.length === 0) {
    res.sendStatus(404);
  } else {
    req.session.pwResetUserIdx = userIdx[0].idx;
    res.sendStatus(200);
  }
});

userRouter.put('/password', async (req, res) => {
  const userIdx = req.session.pwResetUserIdx;
  if (isNullish(userIdx)) {
    res.sendStatus(401);
    return;
  }

  const password = req.body.password;
  if (!isFormatOf(password, { printables: true }) || password.length > 20) {
    res.sendStatus(400);
  }

  const query = 'UPDATE backend.user SET password=$1 WHERE idx=$2';
  await pgQuery(query, [password, userIdx]);

  req.session.destroy();
  res.sendStatus(200);
});

userRouter.put('/', async (req, res) => {
  const userIdx = req.session.userIdx;
  if (isNullish(userIdx)) {
    res.sendStatus(401);
    return;
  }

  const { password, username, nickname, firstName, lastName, email } = req.body;

  const isInputValid =
    isFormatOf(username, {
      alphabet: true,
      number: true,
      minLength: 8,
      maxLength: 20,
    }) &&
    isFormatOf(nickname, {
      alphabet: true,
      koreanComplete: true,
      number: true,
      minLength: 2,
      maxLength: 45,
    }) &&
    isFormatOf(firstName, {
      alphabet: true,
      koreanComplete: true,
      minLength: 1,
      maxLength: 20,
    }) &&
    isFormatOf(lastName, {
      alphabet: true,
      koreanComplete: true,
      minLength: 1,
      maxLength: 20,
    }) &&
    isValidEmail(email) &&
    (isNullish(password) ||
      (!isNullish(password) &&
        isFormatOf(password, {
          printables: true,
          minLength: 8,
          maxLength: 20,
        })));

  if (isInputValid) {
    res.sendStatus(400);
    return;
  }

  let query = null;
  const values = [];

  if (isNullish(password)) {
    query =
      'UPDATE backend.user SET nickname=$1, first_name=$2, last_name=$3, email=$4 WHERE idx=$4';
    values.push(nickname, firstName, lastName, email, userIdx);
  } else {
    query =
      'UPDATE backend.user SET nickname=$1, first_name=$2, last_name=$3, email=$4, password=$5' +
      ' WHERE idx=$6';
    values.push(nickname, firstName, lastName, email, password, userIdx);
  }

  await pgQuery(query, values);

  res.sendStatus(200);
});

userRouter.delete('/', async (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  const query = 'UPDATE backend.user SET is_deleted=TRUE WHERE idx=$1;';
  await pgQuery(query, [authorIdx]);

  res.sendStatus(200);
});

userRouter.post('/', async (req, res) => {
  const { password, username, nickname, firstName, lastName, email } = req.body;

  const isInputValid =
    isFormatOf(password, {
      printables: true,
      minLength: 8,
      maxLength: 20,
    }) &&
    isFormatOf(username, {
      alphabet: true,
      number: true,
      minLength: 8,
      maxLength: 20,
    }) &&
    isFormatOf(nickname, {
      alphabet: true,
      koreanComplete: true,
      number: true,
      minLength: 2,
      maxLength: 45,
    }) &&
    isFormatOf(firstName, {
      alphabet: true,
      koreanComplete: true,
      minLength: 1,
      maxLength: 20,
    }) &&
    isFormatOf(lastName, {
      alphabet: true,
      koreanComplete: true,
      minLength: 1,
      maxLength: 20,
    }) &&
    isValidEmail(email);

  if (!isInputValid) {
    res.sendStatus(400);
    return;
  }

  const query =
    'INSERT INTO backend.user (username, nickname, first_name, last_name, email, password)' +
    ' VALUES ($1, $2, $3, $4, $5, $6);';

  await pgQuery(query, [
    username,
    nickname,
    firstName,
    lastName,
    email,
    password,
  ]);

  res.sendStatus(200);
});

userRouter.get('/username/availability', async (req, res) => {
  const username = req.query.username;
  const isUsernameValid = isFormatOf(username, {
    alphabet: true,
    number: true,
    minLength: 8,
    maxLength: 20,
  });

  if (!isUsernameValid) {
    res.sendStatus(400);
    return;
  }

  const query = 'SELECT COUNT(*) AS count FROM backend.user WHERE username=$1';
  const count = await pgQuery(query, [username]);

  if (Number(count.rows[0].count) === 0) {
    res.json({
      availability: true,
    });
  } else {
    res.json({
      availability: false,
    });
  }
});

userRouter.get('/email/availability', async (req, res) => {
  const email = req.query.email;

  if (isValidEmail(email)) {
    res.sendStatus(400);
    return;
  }

  const query = 'SELECT COUNT(*) AS count FROM backend.user WHERE email=$1';
  const count = Number((await pgQuery(query, [email])).rows[0].count);

  if (count === 0) {
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
  const { username, password } = req.body;

  const isInputValid =
    isFormatOf(password, {
      printables: true,
      minLength: 8,
      maxLength: 20,
    }) &&
    isFormatOf(username, {
      alphabet: true,
      number: true,
      minLength: 8,
      maxLength: 20,
    });

  if (!isInputValid) {
    res.sendStatus(400);
    return;
  }

  const query =
    'SELECT idx FROM backend.user WHERE username=$1 AND password=$2;';
  const userIdx = (await pgQuery(query, [username, password])).rows[0];

  if (!userIdx) {
    res.sendStatus(404);
  }

  req.session.userIdx = userIdx.idx;
  res.sendStatus(200);
});

userRouter.get('/signout', (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  req.session.destroy();

  res.sendStatus(200);
});

export default userRouter;
