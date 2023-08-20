import express from 'express';
import { isNullish, isNumber } from '../utils/validation.js';
import dbConfig from '../utils/db_config.js';
import { createConnection } from 'mariadb';
import asyncify from 'express-asyncify';

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

  const connection = await createConnection(dbConfig);
  const query = 'UPDATE comment SET content=? WHERE id=? AND author_id=?;';
  await connection.query(query, [content, commentIdx, authorIdx]);

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

  const connection = await createConnection(dbConfig);
  const query = 'DELETE FROM comment WHERE id=? AND author_id=?;';
  await connection.query(query, [commentIdx, authorIdx]);

  res.sendStatus(200);
});

export default commentRouter;
