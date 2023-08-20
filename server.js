import express from 'express';
import userRouter from './routes/user.js';
import expressSession from 'express-session';
import articleRouter from './routes/article.js';
import commentRouter from './routes/comment.js';
import dbConfig from './utils/db_config.js';
import { createConnection } from 'mariadb';
import asyncify from 'express-asyncify';

const app = asyncify(express());
const port = 3000;

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
  const connection = await createConnection(dbConfig);
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

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
