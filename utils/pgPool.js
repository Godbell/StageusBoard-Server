import pg from 'pg';
const { Pool } = pg;

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const pgPool = new Pool(dbConfig);

pgPool.on('error', (err, client) => {
  console.error('Unexpected Error on PG Client.', err);
});

export default pgPool;
