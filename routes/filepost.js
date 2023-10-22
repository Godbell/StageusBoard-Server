import { Router } from 'express';
import asyncify from 'express-asyncify';
import { deleteFile, fileUploader } from '../utils/fileUploader.js';
import { isNullish } from '../utils/validation.js';
import { pgQuery } from '../utils/pgPool.js';

export const filepostRouter = asyncify(Router());

filepostRouter.post('/', fileUploader.single('file'), async (req, res) => {
  const fileKey = req.file.key;

  if (isNullish(fileKey)) {
    deleteFile(fileKey);
    throw {
      status: 500,
      message: 'file upload error',
    };
  }

  const title = req.body.title;
  const content = req.body.content;

  if (isNullish(title) || isNullish(content)) {
    deleteFile(fileKey);
    throw {
      status: 400,
      message: 'invalid input',
    };
  }

  try {
    const query = `INSERT INTO backend.filepost (title, content, files) VALUES ($1, $2, $3);`;
    await pgQuery(query, [title, content, JSON.stringify([fileKey])]);
  } catch (e) {
    deleteFile(fileKey);
    throw e;
  }

  const result = {
    result: 'success',
  };

  res.locals.result = result;
  res.json(result);
});
