import express from 'express';
import { isFormatOf, isNullish, isValidEmail } from '../utils/validation.js';
import asyncify from 'express-asyncify';
import pgQuery from '../utils/pgPool.js';
import { confirmPasswordReset, signIn, verifyToken } from '../utils/auth.js';

const userRouter = asyncify(express.Router());

userRouter.get('/', async (req, res) => {
  const token = verifyToken(req.cookies.token, 'userIdx');
  const userIdx = token.userIdx;

  const query =
    "SELECT idx, username, first_name, last_name, nickname, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at, email" +
    ' FROM backend.user' +
    ' WHERE idx=$1 AND is_deleted=FALSE;';
  const user = (await pgQuery(query, [userIdx])).rows[0];

  if (!user) {
    throw {
      status: 404,
      message: 'not found',
    };
  }

  const result = {
    result: user,
  };

  res.locals.result = result;
  res.json(result);
});

userRouter.get('/find-username', async (req, res) => {
  const email = req.query.email;
  if (!isValidEmail(email)) {
    throw {
      status: 400,
      message: 'invalid email',
    };
  }

  const query = 'SELECT username FROM backend.user WHERE email=$1;';
  const username = (await pgQuery(query, [email])).rows;

  if (username.length === 0) {
    throw {
      status: 404,
      message: 'not found',
    };
  }

  const result = {
    result: username[0].username,
  };

  res.locals.result = result;
  res.json(result);
});

userRouter.get('/password/authenticate', async (req, res) => {
  const email = req.query.email;
  if (!isValidEmail(email)) {
    throw {
      status: 400,
      message: 'invalid email',
    };
  }

  const query = 'SELECT idx FROM backend.user WHERE email=$1';
  const queryResult = (await pgQuery(query, [email])).rows[0];

  if (queryResult.length === 0) {
    throw {
      status: 404,
      message: 'not found',
    };
  }

  const token = confirmPasswordReset(queryResult.idx);
  res.cookie('token', token, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 3600000,
  });

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});

userRouter.put('/password', async (req, res) => {
  const token = verifyToken(req.cookies.token, 'pwResetUserIdx');
  const userIdx = token.pwResetUserIdx;
  console.log(userIdx);

  const password = req.body.password;
  if (!isFormatOf(password, { printables: true }) || password.length > 20) {
    throw {
      status: 400,
      message: 'not found',
    };
  }

  const query = 'UPDATE backend.user SET password=$1 WHERE idx=$2';
  await pgQuery(query, [password, userIdx]);

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});

userRouter.put('/', async (req, res) => {
  const token = verifyToken(req.cookies.token, 'userIdx');
  const userIdx = token.userIdx;

  const { password, username, nickname, firstName, lastName, email, isAdmin } =
    req.body;

  const isInputValid =
    !isNullish(isAdmin) &&
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
    throw {
      status: 400,
      message: 'invalid input',
    };
  }

  let query = null;
  const values = [];

  if (isNullish(password)) {
    query = `UPDATE backend.user
      SET
      nickname=$1, 
      first_name=$2, 
      last_name=$3, 
      email=$4,
      is_admin=$5
      WHERE idx=$6`;
    values.push(nickname, firstName, lastName, email, isAdmin, userIdx);
  } else {
    query = `UPDATE
      backend.user 
      SET 
      nickname=$1, 
      first_name=$2, 
      last_name=$3, 
      email=$4, 
      password=$5
      is_admin=$6
      WHERE idx=$7`;
    values.push(
      nickname,
      firstName,
      lastName,
      email,
      password,
      userIdx,
      isAdmin,
    );
  }

  await pgQuery(query, values);

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});

userRouter.delete('/', async (req, res) => {
  const token = verifyToken(req.cookies.token, 'userIdx');
  const authorIdx = token.userIdx;

  const query = 'UPDATE backend.user SET is_deleted=TRUE WHERE idx=$1;';
  await pgQuery(query, [authorIdx]);

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});

userRouter.post('/', async (req, res) => {
  const { password, username, nickname, firstName, lastName, email, isAdmin } =
    req.body;

  const isInputValid =
    !isNullish(isAdmin) &&
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
    throw {
      status: 400,
      message: 'invalid input',
    };
  }

  const query = `INSERT INTO backend.user 
    (username, nickname, first_name, last_name, email, password, is_admin)
    VALUES ($1, $2, $3, $4, $5, $6, $7);`;

  await pgQuery(query, [
    username,
    nickname,
    firstName,
    lastName,
    email,
    password,
    isAdmin,
  ]);

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
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
    throw {
      status: 400,
      message: 'invalid username',
    };
  }

  const query = 'SELECT COUNT(*) AS count FROM backend.user WHERE username=$1';
  const count = await pgQuery(query, [username]);

  const result = {
    result: null,
  };

  if (Number(count.rows[0].count) === 0) {
    result.result = true;
  } else {
    result.result = false;
  }

  res.locals.result = result;
  res.json(result);
});

userRouter.get('/email/availability', async (req, res) => {
  const email = req.query.email;

  if (isValidEmail(email)) {
    throw {
      status: 400,
      message: 'invalid email',
    };
  }

  const query = 'SELECT COUNT(*) AS count FROM backend.user WHERE email=$1';
  const count = Number((await pgQuery(query, [email])).rows[0].count);
  const result = {
    result: null,
  };

  if (count === 0) {
    result.result = true;
  } else {
    result.result = false;
  }

  res.locals.result = result;
  res.json(result);
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
    throw {
      status: 400,
      message: 'invalid input',
    };
  }

  const query =
    'SELECT idx, is_admin FROM backend.user WHERE username=$1 AND password=$2;';
  const queryResult = (await pgQuery(query, [username, password])).rows[0];
  const userIdx = queryResult.idx;
  const isAdmin = queryResult.is_admin;

  if (!userIdx) {
    throw {
      status: 401,
      message: 'unauthorized',
    };
  }

  const token = signIn(userIdx, isAdmin);
  res.cookie('token', token, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
    maxAge: 3600000,
  });

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});

userRouter.get('/signout', (req, res) => {
  let token = null;

  token = verifyToken(req.cookies.token, 'userIdx');

  res.cookie('token', null, {
    maxAge: 0,
  });

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});

export default userRouter;
