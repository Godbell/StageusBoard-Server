import express from 'express';
import { isNullish, isNumber } from '../utils/validation.js';
import asyncify from 'express-asyncify';
import pgPool from '../utils/pgPool.js';

const commentRouter = asyncify(express.Router());

commentRouter.put('/:idx', async (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
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

  const connection = await pgPool.connect();
  const query =
    'UPDATE backend.comment SET content=$1 WHERE idx=$2 AND author_idx=$3;';
  await connection.query(query, [content, commentIdx, authorIdx]);
  connection.release();

  res.sendStatus(201);
});

commentRouter.delete('/:idx', async (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  const commentIdx = Number(req.params.idx);
  if (!isNumber(Number(commentIdx)) || commentIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const connection = await pgPool.connect();
  const query = 'DELETE FROM backend.comment WHERE idx=$1 AND author_idx=?;';
  await connection.query(query, [commentIdx, authorIdx]);
  connection.release();

  res.sendStatus(200);
});

export default commentRouter;
