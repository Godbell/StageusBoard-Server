import express from 'express';
import userRouter from './routes/user.js';
import expressSession from 'express-session';
import articleRouter from './routes/article.js';
import commentRouter from './routes/comment.js';
import asyncify from 'express-asyncify';
import pgQuery from './utils/pgPool.js';
import https from 'https';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { configDotenv } from 'dotenv';
import { log } from './utils/logger.js';
import { logRouter } from './routes/log.js';
import { filepostRouter } from './routes/filepost.js';

configDotenv();

const app = asyncify(express());
const httpPort = 3000;
const httpsPort = 3443;

const sslOptions =
  process.env.NODE_ENV === 'production'
    ? {
        key: fs.readFileSync(process.env.SSL_KEY_LOCATION),
        cert: fs.readFileSync(process.env.SSL_CRT_LOCATION),
        ca: fs.readFileSync(process.env.SSL_CA_LOCATION),
      }
    : null;

app.use(express.json());
app.use(cookieParser());
app.use(
  expressSession({
    secret: 'stageusBoardServerSessionSecret',
    resave: true,
    saveUninitialized: true,
    cookie: {
      expires: 7200 * 1000,
    },
  }),
);

app.use(async (req, res, next) => {
  res.on('finish', () => {
    console.log(res.locals.result);

    log({
      ip: req.ip,
      userIdx: req.cookies['userIdx'] ?? req.cookies['pwResetUserIdx'] ?? -1,
      url: req.originalUrl,
      method: req.method,
      response: res.locals.result,
    }).catch((e) => {
      throw e;
    });

    res.locals.result = null;
  });

  next();
});

app.get('/', async (req, res) => {
  const sample = (await pgQuery(`SELECT * from backend.article;`)).rows;

  res.json(sample);
});

app.get('/error', async (req, res) => {
  const sample = (await pgQuery(`SELCT * from bckend.article;`)).rows;

  res.json(sample);
});

app.use('/user', userRouter);
app.use('/article', articleRouter);
app.use('/comment', commentRouter);
app.use('/log', logRouter);
app.use('/filepost', filepostRouter);

app.use((err, req, res, next) => {
  const result = {
    result: null,
  };

  const { status = 500, message } = err;

  err.stack && console.log(err.stack);

  result.result = message;

  res.locals.result = result;
  res.status(status).json(result);
});

if (process.env.NODE_ENV === 'production') {
  https.createServer(sslOptions, app).listen(httpsPort, () => {
    console.log(`Server is listening on port ${httpsPort}`);
  });
} else {
  app.listen(httpPort, () => {
    console.log(`Server is listening on port ${httpPort}`);
  });
}
