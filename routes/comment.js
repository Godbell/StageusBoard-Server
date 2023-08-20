import express from 'express';
import { isNullish, isNumber } from '../utils/validation.js';

const commentRouter = express.Router();

commentRouter.put('/:idx', (req, res) => {
  if (!isNullish(req.session.userIdx)) {
    res.sendStatus(401);
    return;
  }

  const commentIdx = Number(req.params.idx);
  if (!isNumber(Number(commentIdx)) || commentIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const content = req.body.content;
  if (isNullish(content)) {
    res.sendStatus(400);
    return;
  }

  const result = true;
  console.log('edit comment');

  if (result === true) {
    res.sendStatus(201);
  } else {
    res.sendStatus(400);
  }
});

commentRouter.delete('/:idx', (req, res) => {
  if (!isNullish(req.session.userIdx)) {
    res.sendStatus(401);
    return;
  }

  const commentIdx = Number(req.params.idx);
  if (!isNumber(Number(commentIdx)) || commentIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const result = true;
  console.log('delete comment');

  if (result === true) {
    res.sendStatus(201);
  } else {
    res.sendStatus(400);
  }
});

export default commentRouter;
