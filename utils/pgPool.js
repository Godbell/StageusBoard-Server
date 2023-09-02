import { configDotenv } from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

configDotenv();

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

console.log(
  `Created PG Pool to ${dbConfig.host}:${dbConfig.port} with user ${dbConfig.user}`,
);

const pgQuery = async (query, parameters = undefined) => {
  const connection = await pgPool.connect();
  const result = await connection.query(query, parameters);
  connection.release();

  return result;
};

export default pgQuery;
