import express from 'express';
import { isNullish, isNumber, isValidUuid } from '../utils/validation.js';
import asyncify from 'express-asyncify';
import pgPool from '../utils/pgPool.js';
import { v4 } from 'uuid';

const articleRouter = asyncify(express.Router());

articleRouter.get('/all', async (req, res) => {
  const connection = await pgPool.connect();
  const query =
    'SELECT backend.article.idx, title, content,' +
    " TO_CHAR(backend.article.created_at, 'YYYY-MM-DD HH24:MI:SS'), backend.user.nickname" +
    ' FROM backend.article' +
    ' JOIN backend.user' +
    ' ON author_idx=backend.user.idx' +
    ' WHERE backend.user.is_deleted=FALSE;';
  const articles = (await connection.query(query)).rows;
  connection.release();

  res.json(articles);
});

articleRouter.get('/:idx', async (req, res) => {
  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const connection = await pgPool.connect();
  const query =
    'SELECT backend.article.idx, title, content,' +
    " TO_CHAR(backend.article.created_at, 'YYYY-MM-DD HH24:MI:SS')" +
    ' AS created_at, backend.user.nickname' +
    ' FROM backend.article' +
    ' JOIN backend.user' +
    ' ON author_idx=backend.user.idx' +
    ' WHERE backend.article.idx=$1 AND backend.article.is_deleted=FALSE;';
  const article = (await connection.query(query, [articleIdx])).rows[0];
  connection.release();

  if (article) {
    res.sendStatus(404);
  } else {
    res.json(article);
  }
});

articleRouter.post('/', async (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  const title = req.body.title;
  const content = req.body.content;

  if (isNullish(title) || title.length > 100 || isNullish(content)) {
    res.sendStatus(400);
    return;
  }

  const connection = await pgPool.connect();
  const articleUploadQuery =
    'INSERT INTO backend.article (author_idx, title, content) VALUES ($1, $2, $3);';
  await connection.query(articleUploadQuery, [authorIdx, title, content]);

  connection.release();

  res.sendStatus(201);
});

articleRouter.put('/:idx', async (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const title = req.body.title;
  const content = req.body.content;

  if (isNullish(title) || title.length > 100 || isNullish(content)) {
    res.sendStatus(400);
    return;
  }

  const connection = await pgPool.connect();
  const query =
    'UPDATE backend.article SET title=$1, content=$2' +
    ' WHERE idx=$3' +
    ' AND author_idx=$4;';
  await connection.query(query, [title, content, articleIdx, authorIdx]);
  connection.release();

  res.sendStatus(200);
});

articleRouter.delete('/:idx', async (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const connection = await pgPool.connect();
  const query =
    'UPDATE backend.article SET is_deleted=TRUE WHERE idx=$1 AND author_idx=$2;';
  await connection.query(query, [articleIdx, authorIdx]);
  connection.release();

  res.sendStatus(200);
});

articleRouter.get('/:idx/comment/all', async (req, res) => {
  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const connection = await pgPool.connect();
  const query = `SELECT data AS comments FROM backend.comment WHERE article_idx=$1;`;
  const comments = (await connection.query(query, [articleIdx])).rows[0];
  connection.release();

  res.json(comments ?? []);
});

articleRouter.post('/:idx/comment', async (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  const articleIdx = Number(req.params.idx);
  const content = req.body.content;
  const ref = req.body.ref ?? null;
  const isInputValid =
    isNumber(articleIdx) &&
    articleIdx >= 0 &&
    isNumber(depth) &&
    depth >= 0 &&
    !isNullish(content) &&
    (ref === null || isValidUuid(ref));
  if (isInputValid) {
    res.sendStatus(400);
    return;
  }

  const connection = await pgPool.connect();

  const currentCommentsQuery = `SELECT data FROM backend.comment WHERE article_idx=$1;`;
  const comments = (await connection.query(currentCommentsQuery, [articleIdx]))
    .rows[0] ?? {
    comments: [],
  };

  if (!JSON.stringify(comments).includes(`"id": "${ref}"`)) {
    res.sendStatus(400);
    return;
  }

  connection.release();

  res.sendStatus(201);
});

export default articleRouter;
