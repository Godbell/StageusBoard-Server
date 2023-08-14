import express from 'express';
import {
  getUserProfile,
  editUser,
  addUser,
  checkSignInData,
} from '../services/user.js';

const userRouter = express.Router();

userRouter.get('/:idx', (req, res) => {
  if (
    req.session.userIdx === undefined ||
    req.params.idx !== req.session.userIdx
  ) {
    res.sendStatus(401);
    return;
  }

  const user = getUserProfile(Number(req.params.idx));

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

userRouter.post('/:idx/edit-password', (req, res) => {
  if (
    req.session.userIdx === undefined ||
    req.params.idx !== req.session.userIdx
  ) {
    res.sendStatus(401);
    return;
  }

  const result = editUser(Number(req.params.idx), {
    password: req.body.password,
  });

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
