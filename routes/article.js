import express from 'express';
import {
  addArticle,
  deleteArticle,
  editArticle,
  getArticle,
} from '../services/article';

const articleRouter = express.Router();

articleRouter.get(':idx', (req, res) => {
  const article = getArticle(Number(req.params.idx));

  if (article) {
    res.json(article);
  } else {
    res.sendStatus(404);
  }
});

articleRouter.post('/add', (req, res) => {
  if (req.session.userIdx === undefined) {
    res.sendStatus(401);
    return;
  }

  const result = addArticle({
    authorIdx: req.session.userIdx,
    title: req.body.title,
    content: req.body.content,
  });

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

articleRouter.post(':idx/edit', (req, res) => {
  if (req.session.userIdx === undefined) {
    res.sendStatus(401);
    return;
  }

  const result = editArticle({
    signedUserIdx: Number(req.session.userIdx),
    articleIdx: Number(req.params.idx),
    title: req.body.title,
    content: req.body.content,
  });

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

articleRouter.post(':idx/delete', (req, res) => {
  if (req.session.userIdx === undefined) {
    res.sendStatus(401);
    return;
  }

  const result = deleteArticle(
    Number(req.params.idx),
    Number(req.session.userIdx),
  );

  if (result === true) {
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

export default articleRouter;
