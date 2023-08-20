import express from 'express';
import {
  addComment,
  deleteComment,
  editComment,
  getComment,
} from '../services/comment.js';

const commentRouter = express.Router();

commentRouter.get('/:idx', (req, res) => {
  const comment = getComment(Number(req.params.idx));

  if (comment) {
    res.json(comment);
  } else {
    res.sendStatus(404);
  }
});

commentRouter.post('/', (req, res) => {
  if (req.session.userIdx === undefined) {
    res.sendStatus(401);
    return;
  }

  const result = addComment({
    authorIdx: Number(req.session.userIdx),
    articleIdx: Number(req.body.articleIdx),
    title: req.body.title,
    content: req.body.content,
  });

  if (result === true) {
    res.sendStatus(201);
  } else {
    res.sendStatus(400);
  }
});

commentRouter.put('/:idx', (req, res) => {
  if (req.session.userIdx === undefined) {
    res.sendStatus(401);
    return;
  }

  const result = editComment({
    signedUserIdx: Number(req.session.userIdx),
    content: req.body.content,
  });

  if (result === true) {
    res.sendStatus(201);
  } else {
    res.sendStatus(400);
  }
});

commentRouter.delete('/:idx', (req, res) => {
  if (req.session.userIdx === undefined) {
    res.sendStatus(401);
    return;
  }

  const result = deleteComment(
    Number(req.params.idx),
    Number(req.session.userIdx),
  );

  if (result === true) {
    res.sendStatus(201);
  } else {
    res.sendStatus(400);
  }
});

export default commentRouter;
