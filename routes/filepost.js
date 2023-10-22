import { Router } from 'express';
import asyncify from 'express-asyncify';
import { deleteFile, fileUploader } from '../utils/fileUploader.js';
import { isNullish, isNumber } from '../utils/validation.js';
import { pgQuery } from '../utils/pgPool.js';

export const filepostRouter = asyncify(Router());

filepostRouter.get('/all', async (req, res) => {
  const result = {
    result: null,
  };

  result.result = (
    await pgQuery(
      `SELECT idx, title, content, created_at, files FROM backend.filepost;`,
    )
  ).rows;

  res.locals.result = result;
  res.json(result);
});

filepostRouter.get('/:idx', async (req, res) => {
  if (isNullish(req.params.idx) || !isNumber(req.params.idx)) {
    throw {
      status: 400,
      message: 'invalid idx',
    };
  }

  const result = {
    result: null,
  };

  result.result = (
    await pgQuery(
      `SELECT title, content, created_at, files FROM backend.filepost
      WHERE idx=$1;`,
      [req.params.idx],
    )
  ).rows[0];

  if (result.result === undefined) {
    throw {
      status: 404,
      message: 'not found',
    };
  }

  res.locals.result = result;
  res.json(result);
});

filepostRouter.post('/', fileUploader.single('file'), async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;

  if (
    (!isNullish(title) && isNullish(content)) ||
    (isNullish(title) && !isNullish(content))
  ) {
    await deleteFile(req.file.key);
    throw {
      status: 400,
      message: 'invalid input',
    };
  }

  try {
    const query = `INSERT INTO backend.filepost (title, content, files) VALUES ($1, $2, $3);`;
    await pgQuery(query, [
      title,
      content,
      JSON.stringify({
        key: req.file.key,
        location: req.file.location,
      }),
    ]);
  } catch (e) {
    await deleteFile(req.file.key);
    throw e;
  }

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});

filepostRouter.post(
  '/multipart',
  fileUploader.array('file'),
  async (req, res) => {
    const title = req.body.title;
    const content = req.body.content;

    if (
      (!isNullish(title) && isNullish(content)) ||
      (isNullish(title) && !isNullish(content))
    ) {
      await Promise.all(req.files.map((fileKey) => deleteFile(fileKey)));
      throw {
        status: 400,
        message: 'invalid input',
      };
    }

    try {
      const query = `INSERT INTO backend.filepost (title, content, files) VALUES ($1, $2, $3);`;
      await pgQuery(query, [
        title,
        content,
        JSON.stringify(
          req.files.map((file) => ({
            key: file.key,
            location: file.location,
          })),
        ),
      ]);
    } catch (e) {
      await Promise.all(req.files.map((file) => deleteFile(file.key)));
      throw e;
    }

    const result = {
      result: 'success',
    };

    res.locals.result = result;
    res.json(result);
  },
);

filepostRouter.put('/:idx', fileUploader.array('file'), async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const filesToDelete = req.body.filesToDelete;

  if (isNullish(req.params.idx) || !isNumber(req.params.idx)) {
    throw {
      status: 400,
      message: 'invalid idx',
    };
  }

  if (
    (!isNullish(title) && isNullish(content)) ||
    (isNullish(title) && !isNullish(content))
  ) {
    await Promise.all(req.files.map((fileKey) => deleteFile(fileKey)));
    throw {
      status: 400,
      message: 'invalid input',
    };
  }

  const existingFiles = (
    await pgQuery(`SELECT files FROM backend.filepost WHERE idx=$1`, [
      req.params.idx,
    ])
  ).rows[0];

  const afterDeleteFiles = existingFiles.filter(
    (file) => !filesToDelete.includes(file.key),
  );

  const resultFiles = [
    ...afterDeleteFiles,
    ...req.files.map((file) => ({
      key: file.key,
      location: file.location,
    })),
  ];

  try {
    const query = `UPDATE backend.filepost SET title=$1, content=$2, files=$3 WHERE idx=$4;`;
    await pgQuery(query, [
      title,
      content,
      JSON.stringify(resultFiles),
      req.params.idx,
    ]);
  } catch (e) {
    await Promise.all(req.files.map((file) => deleteFile(file.key)));
    throw e;
  }

  await Promise.all(filesToDelete.map((fileKey) => deleteFile(fileKey)));

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});
