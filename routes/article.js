import express from 'express';
import { isNullish, isNumber } from '../utils/validation.js';

const articleRouter = express.Router();

articleRouter.get('/all', (req, res) => {
  const result = true;
  console.log('get articles');

  if (result) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

articleRouter.get('/:idx', (req, res) => {
  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    res.sendStatus(400);
    return;
  }

  if (!isNumber(Number(req.params.idx))) {
    res.sendStatus(400);
    return;
  }

  const result = true;
  console.log('get article');

  if (result) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
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
