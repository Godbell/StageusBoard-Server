import express from 'express';
import { isNullish, isNumber } from '../utils/validation.js';
import dbConfig from '../utils/db_config.js';
import { createConnection } from 'mariadb';
import asyncify from 'express-asyncify';

const articleRouter = asyncify(express.Router());

articleRouter.get('/all', async (req, res) => {
  const connection = await createConnection(dbConfig);
  const query =
    'SELECT article.id as idx, title, content, article.created_at, user.nickname FROM article JOIN user ON author_id=user.id;';
  const articles = await connection.query(query);
  res.json(articles);
});

articleRouter.get('/:idx', async (req, res) => {
  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  (async () => {
    try {
      const connection = await createConnection(dbConfig);
      const query =
        'SELECT article.id as idx, title, content, article.created_at, user.nickname FROM article JOIN user ON author_id=user.id WHERE article.id=?;';
      const article = await connection.query(query, [articleIdx]);

      if (article.length === 0) {
        res.sendStatus(404);
      } else {
        res.json(article);
      }
    } catch (e) {
      res.sendStatus(500);
      console.log(e);
    }
  })();
});

articleRouter.post('/', (req, res) => {
  if (!isNullish(req.session.userIdx)) {
    res.sendStatus(401);
    return;
  }

  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const authorIdx = req.session.userIdx;
  const title = req.body.title;
  const content = req.body.content;

  if (isNullish(title) || title.length > 100 || isNullish(content)) {
    res.sendStatus(400);
    return;
  }

  const result = true;
  console.log('add article');

  if (result === true) {
    res.sendStatus(201);
  } else {
    res.sendStatus(400);
  }
});

articleRouter.put('/:idx', (req, res) => {
  if (!isNullish(req.session.userIdx)) {
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

  const result = true;
  console.log('edit article');

  if (result === true) {
    res.sendStatus(201);
  } else {
    res.sendStatus(400);
  }
});

articleRouter.delete('/:idx', (req, res) => {
  if (!isNullish(req.session.userIdx)) {
    res.sendStatus(401);
    return;
  }

  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const result = true;
  console.log('delete article');

  if (result === true) {
    res.sendStatus(201);
  } else {
    res.sendStatus(404);
  }
});

articleRouter.get('/:idx/comment/all', (req, res) => {
  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  const result = true;
  console.log('get article comment');

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

articleRouter.post('/:idx/comment', (req, res) => {
  if (!isNullish(req.session.userIdx)) {
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

  const result = true;
  console.log('add comment');

  if (result === true) {
    res.sendStatus(201);
  } else {
    res.sendStatus(400);
  }
});

export default articleRouter;
