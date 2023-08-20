import express from 'express';
import { deleteComment, editComment } from '../services/comment.js';

const commentRouter = express.Router();

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
