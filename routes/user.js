import express from 'express';
import {
  getUserProfile,
  editUser,
  addUser,
  checkSignInData,
  deleteUser,
} from '../services/user.js';

const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  if (req.session.userIdx === undefined) {
    res.sendStatus(401);
    return;
  }

  const user = getUserProfile(Number(req.session.idx));

  if (user) {
    res.json({
      idx: user.idx,
      username: user.username,
      nickname: user.nickname,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
    });
  } else {
    res.sendStatus(404);
  }
});

userRouter.post('/edit-password', (req, res) => {
  if (req.session.userIdx === undefined) {
    res.sendStatus(401);
    return;
  }

  const result = editUser(Number(req.session.idx), {
    password: req.body.password,
  });

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

userRouter.post('/delete', (req, req) => {
  if (req.session.userIdx === undefined) {
    res.sendStatus(401);
    return;
  }

  const result = deleteUser(req.session.userIdx);

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

userRouter.post('/signup', (req, res) => {
  const result = addUser({
    username: body.username,
    password: body.password,
    nickname: body.nickname,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
  });

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

userRouter.post('/signin', (req, res) => {
  const result = checkSignInData(req.body.username, req.body.password);

  if (result === true) {
    req.session.userIdx = req.body.idx;
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

userRouter.post('/signout', (req, res) => {
  req.session.destroy((err) => {
    res.sendStatus(400);
  });
});

export default userRouter;
