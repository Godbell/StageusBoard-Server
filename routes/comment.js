import express from 'express';
import { isNullish, isNumber } from '../utils/validation.js';
import asyncify from 'express-asyncify';
import pgQuery from '../utils/pgPool.js';

const commentRouter = asyncify(express.Router());

commentRouter.put('/', async (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    throw {
      status: 401,
      message: 'unauthorized',
    };
  }

  const articleIdx = Number(req.body.articleIdx);
  const content = req.body.content;
  const ref = req.body.ref ?? [];
  const commentId = req.body.commentId;
  const isInputValid =
    isNumber(articleIdx) && isNumber(articleIdx) >= 0 && !isNullish(content);

  if (!isInputValid) {
    throw {
      status: 400,
      message: 'invalid input',
    };
  }

  const currentCommentsQuery = `SELECT data FROM backend.comment WHERE article_idx=$1;`;
  const comments =
    (await pgQuery(currentCommentsQuery, [articleIdx])).rows[0]?.data ?? {};

  const targetComment =
    ref.reduce(
      (prev, curr) => (!isNullish(prev) ? prev[curr] : null),
      comments,
    )[commentId] ?? null;

  if (targetComment === null) {
    throw {
      status: 400,
      message: 'invalid comment path',
    };
  }

  targetComment.content = content;

  const updateCommentQuery = `UPDATE backend.comment SET data=$1 WHERE article_idx=$2;`;
  await pgQuery(updateCommentQuery, [JSON.stringify(comments), articleIdx]);

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});

commentRouter.delete('/', async (req, res) => {
  const authorIdx = req.session.userIdx;
  if (isNullish(authorIdx)) {
    res.sendStatus(401);
    return;
  }

  const articleIdx = Number(req.body.articleIdx);
  const content = req.body.content;
  const ref = req.body.ref ?? [];
  const commentId = req.body.commentId;
  const isInputValid =
    isNumber(articleIdx) && isNumber(articleIdx) >= 0 && !isNullish(content);

  if (!isInputValid) {
    throw {
      status: 400,
      message: 'invalid input',
    };
  }

  const currentCommentsQuery = `SELECT data FROM backend.comment WHERE article_idx=$1;`;
  const comments =
    (await pgQuery(currentCommentsQuery, [articleIdx])).rows[0]?.data ?? {};

  const targetCommentLocation =
    ref.reduce(
      (prev, curr) => (!isNullish(prev) ? prev[curr] : null),
      comments,
    ) ?? null;

  if (targetCommentLocation === null) {
    throw {
      status: 400,
      message: 'invalid comment path',
    };
  }

  delete targetCommentLocation[commentId];

  const updateCommentQuery = `UPDATE backend.comment SET data=$1 WHERE article_idx=$2;`;
  await pgQuery(updateCommentQuery, [JSON.stringify(comments), articleIdx]);

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});

// RESET
commentRouter.get('/reset', async (req, res) => {
  const initialCommentData = JSON.stringify({
    '52d0f3a6-521e-4680-8519-f152ddb09564': {
      content: 'comment of f0c15d18-4cb1-4e7b-a511-41991715e309',
      created_at: '2023-01-01 23:22:11',
      author_idx: 2,
      '835a32b9-4286-4e49-90b3-5218788abfe9': {
        content: 'comment of f0c15d18-4cb1-4e7b-a511-41991715e309',
        created_at: '2023-01-01 23:22:11',
        author_idx: 2,
      },
      'af7526ba-68cf-4e25-85de-302911243c80': {
        content: 'comment of f0c15d18-4cb1-4e7b-a511-41991715e309',
        created_at: '2023-01-01 23:22:11',
        author_idx: 2,
        'f0c15d18-4cb1-4e7b-a511-41991715e309': {
          content: 'comment of f0c15d18-4cb1-4e7b-a511-41991715e309',
          created_at: '2023-01-01 23:22:11',
          author_idx: 2,
        },
      },
      'de878f9e-d297-4dee-8dc8-1507f782c9f7': {
        content: 'comment of f0c15d18-4cb1-4e7b-a511-41991715e309',
        author_idx: 2,
        created_at: '2023-01-01 23:22:11',
      },
    },
    '69cee3e0-d654-47ee-bcd3-42872aa7e867': {
      content: 'test comment content',
      author_idx: 2,
      created_idx: '2023-09-01 13:36:50',
    },
  });

  await pgQuery('UPDATE backend.comment SET data=$1 WHERE article_idx=4;', [
    initialCommentData,
  ]);

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});

export default commentRouter;
