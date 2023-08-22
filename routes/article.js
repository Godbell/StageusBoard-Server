import express from 'express';
import { isNullish, isNumber } from '../utils/validation.js';
import asyncify from 'express-asyncify';
import mariadbPool from '../utils/mariadbPool.js';

const articleRouter = asyncify(express.Router());

articleRouter.get('/all', async (req, res) => {
  const query =
    'SELECT article.id as idx, title, content, article.created_at, user.nickname' +
    ' FROM article' +
    ' JOIN user' +
    ' ON author_id=user.id;';
  const articles = await mariadbPool.query(query);
  res.json(articles);
});

articleRouter.get('/:idx', async (req, res) => {
  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const query =
    'SELECT article.id as idx, title, content, DATE_FORMAT(article.created_at, "%Y-%m-%d %h:%i:%s") as created_at, user.nickname' +
    ' FROM article' +
    ' JOIN user' +
    ' ON author_id=user.id' +
    ' WHERE article.id=?;';
  const article = await mariadbPool.query(query, [articleIdx]);

  if (article.length === 0) {
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

  const query =
    'INSERT INTO article (author_id, title, content) VALUES (?, ?, ?);';
  await mariadbPool.query(query, [authorIdx, title, content]);

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

  const query =
    'UPDATE article SET title=?, content=?' +
    ' WHERE id=?' +
    ' AND author_id=?;';
  await mariadbPool.query(query, [title, content, articleIdx, authorIdx]);

  if (result === true) {
    res.sendStatus(201);
  } else {
    res.sendStatus(400);
  }
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

  const query = 'DELETE FROM article WHERE id=? AND author_id=?;';
  await mariadbPool.query(query, [articleIdx, authorIdx]);

  res.sendStatus(200);
});

articleRouter.get('/:idx/comment/all', async (req, res) => {
  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const query =
    'SELECT comment.id as idx, content, nickname, DATE_FORMAT(comment.created_at, "%Y-%m-%d %h:%i:%s") as created_at' +
    ' FROM comment' +
    ' JOIN user' +
    ' ON author_id=user.id' +
    ' WHERE article_id=?';
  const comments = await mariadbPool.query(query, [articleIdx]);

  res.json(comments);
});

articleRouter.post('/:idx/comment', async (req, res) => {
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

  const content = req.body.content;
  if (isNullish(content)) {
    res.sendStatus(400);
    return;
  }

  const query =
    'INSERT INTO comment (article_id, author_id, content) VALUES (?, ?, ?);';
  await mariadbPool.query(query, [articleIdx, authorIdx, content]);

  res.sendStatus(201);
});

export default articleRouter;
