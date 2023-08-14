import express from 'express';
import userRouter from './routes/user.js';
import expressSession from 'express-session';

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
  res.send('Root');
});

app.use('/user', userRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
