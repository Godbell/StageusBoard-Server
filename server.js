import express from 'express';
import userRouter from './routes/user.js';
import expressSession from 'express-session';
import articleRouter from './routes/article.js';
import commentRouter from './routes/comment.js';
import asyncify from 'express-asyncify';
import pgPool from './utils/pgPool.js';
import https from 'https';
import fs from 'fs';
import { configDotenv } from 'dotenv';

configDotenv();

const app = asyncify(express());
const httpPort = 3000;
const httpsPort = 3443;
const sslOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_LOCATION),
  cert: fs.readFileSync(process.env.SSL_CRT_LOCATION),
  ca: fs.readFileSync(process.env.SSL_CA_LOCATION),
};

app.use(express.json());
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

app.get('/', async (req, res) => {
  const connection = await pgPool.connect();
  const sample = await connection.query('SELECT * FROM article');
  res.json(sample);
});

app.get('/error', async (req, res) => {
  throw new Error('test');
});

app.use('/user', userRouter);
app.use('/article', articleRouter);
app.use('/comment', commentRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.sendStatus(500);
});

app.listen(httpPort, () => {
  console.log(`Server is listening on port ${httpPort}`);
});

https.createServer(sslOptions, app).listen(httpsPort);
