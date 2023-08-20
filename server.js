import express from 'express';
import userRouter from './routes/user.js';
import expressSession from 'express-session';
import articleRouter from './routes/article.js';
import commentRouter from './routes/comment.js';
import dbConfig from './utils/db_config.js';
import { createConnection } from 'mariadb';

const app = express();
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

app.get('/', (req, res) => {
  try {
    (async () => {
      const connection = await createConnection(dbConfig);
      const users = await connection.query('SELECT * FROM user');
      res.json(users);
    })();
  } catch (e) {
    res.send(e);
  }
});

app.use('/user', userRouter);
app.use('/article', articleRouter);
app.use('/comment', commentRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
