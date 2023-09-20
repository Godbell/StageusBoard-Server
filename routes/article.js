import express from 'express';
import { isNullish, isNumber, isValidUuid } from '../utils/validation.js';
import asyncify from 'express-asyncify';
import pgQuery from '../utils/pgPool.js';
import { v4 } from 'uuid';

const articleRouter = asyncify(express.Router());

articleRouter.get('/all', async (req, res) => {
  const result = {
    result: null,
  };

  const query =
    'SELECT backend.article.idx, title, content,' +
    " TO_CHAR(backend.article.created_at, 'YYYY-MM-DD HH24:MI:SS'), backend.user.nickname" +
    ' FROM backend.article' +
    ' JOIN backend.user' +
    ' ON author_idx=backend.user.idx' +
    ' WHERE backend.user.is_deleted=FALSE;';
  const articles = (await pgQuery(query)).rows;

  result.result = articles;
  res.locals.result = result;

  res.json(result);
});

articleRouter.get('/:idx', async (req, res) => {
  const result = {
    result: null,
  };

  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    throw {
      status: 400,
      message: `invalid article index: ${articleIdx}`,
    };
  }

  const query =
    'SELECT backend.article.idx, title, content,' +
    " TO_CHAR(backend.article.created_at, 'YYYY-MM-DD HH24:MI:SS')" +
    ' AS created_at, backend.user.nickname' +
    ' FROM backend.article' +
    ' JOIN backend.user' +
    ' ON author_idx=backend.user.idx' +
    ' WHERE backend.article.idx=$1 AND backend.article.is_deleted=FALSE;';
  const article = (await pgQuery(query, [articleIdx])).rows[0];

  if (article) {
    result.result = article;
    res.locals.result = result;

    res.json(result);
  } else
    throw {
      status: 404,
      message: 'not found',
    };
});

articleRouter.post('/', async (req, res) => {
  const result = {
    result: null,
  };

  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    throw {
      status: 401,
      message: 'unauthorized',
    };
  }

  const title = req.body.title;
  const content = req.body.content;

  if (isNullish(title) || title.length > 100 || isNullish(content)) {
    throw {
      status: 400,
      message: 'invalid title or content',
    };
  }

  const articleUploadQuery =
    'INSERT INTO backend.article (author_idx, title, content) VALUES ($1, $2, $3);';
  await pgQuery(articleUploadQuery, [authorIdx, title, content]);

  result.result = 'success';
  res.locals.result = result;

  res.json(result);
});

articleRouter.put('/:idx', async (req, res) => {
  const result = {
    result: null,
  };

  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    throw {
      status: 401,
      message: 'unauthorized',
    };
  }

  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    throw {
      status: 400,
      message: `invalid article index: ${articleIdx}`,
    };
  }

  const title = req.body.title;
  const content = req.body.content;

  if (isNullish(title) || title.length > 100 || isNullish(content)) {
    throw {
      status: 400,
      message: 'invalid title or content',
    };
  }

  const query =
    'UPDATE backend.article SET title=$1, content=$2' +
    ' WHERE idx=$3' +
    ' AND author_idx=$4; WHERE is_deleted=FALSE;';
  await pgQuery(query, [title, content, articleIdx, authorIdx]);

  result.result = 'success';
  res.locals.result = result;

  res.json(result);
});

articleRouter.delete('/:idx', async (req, res) => {
  const result = {
    result: null,
  };

  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    throw {
      status: 401,
      message: 'unauthorized',
    };
  }

  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    throw {
      status: 400,
      message: `invalid article index: ${articleIdx}`,
    };
  }

  const query =
    'UPDATE backend.article SET is_deleted=TRUE WHERE idx=$1 AND author_idx=$2;';
  await pgQuery(query, [articleIdx, authorIdx]);

  result.result = 'success';
  res.locals.result = result;

  res.json(result);
});

articleRouter.get('/:idx/comment/all', async (req, res) => {
  const result = {
    result: null,
  };

  const articleIdx = Number(req.params.idx);
  if (!isNumber(articleIdx) || articleIdx < 0) {
    throw {
      status: 400,
      message: `invalid article index: ${articleIdx}`,
    };
  }

  const query = `SELECT data FROM backend.comment WHERE article_idx=$1;`;
  const comments = (await pgQuery(query, [articleIdx])).rows[0]?.data;

  result.result = comments ?? {};
  res.locals.result = result;

  res.json(result);
});

articleRouter.post('/:idx/comment', async (req, res) => {
  const result = {
    result: null,
  };

  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    throw {
      status: 401,
      message: 'unauthorized',
    };
  }

  const articleIdx = Number(req.params.idx);
  const content = req.body.content;
  const ref = req.body.ref ?? [];
  const isInputValid =
    isNumber(articleIdx) && articleIdx >= 0 && !isNullish(content);

  if (!isInputValid) {
    throw {
      status: 400,
      message: `invalid article index(${articleIdx}) or content`,
    };
  }

  const currentCommentsQuery = `SELECT data FROM backend.comment WHERE article_idx=$1;`;
  const comments =
    (await pgQuery(currentCommentsQuery, [articleIdx])).rows[0]?.data ?? {};

  const targetComment =
    ref.reduce((prev, curr) => prev[curr], comments) ?? comments;

  targetComment[v4()] = {
    author_idx: authorIdx,
    created_idx: new Date(Date.now() + new Date(Date.now()).getTimezoneOffset())
      .toISOString()
      .replace('T', ' ')
      .split('.')[0],
    content: content,
  };

  const updateCommentQuery = `UPDATE backend.comment SET data=$1 WHERE article_idx=$2;`;
  await pgQuery(updateCommentQuery, [JSON.stringify(comments), articleIdx]);

  result.result = 'success';
  res.locals.result = result;
});

export default articleRouter;
