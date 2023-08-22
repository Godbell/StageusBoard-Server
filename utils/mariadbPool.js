import { configDotenv } from 'dotenv';
import { createPool } from 'mariadb';

configDotenv();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const mariadbPool = createPool(dbConfig);

export default mariadbPool;
