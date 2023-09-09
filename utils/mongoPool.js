import { configDotenv } from 'dotenv';
import mongoose from 'mongoose';

configDotenv();

const mongoPool = mongoose.createConnection(
  `mongodb://${process.env.DDB_USER}:${process.env.DDB_PASSWORD}@${process.env.DDB_HOST}:${process.env.DDB_PORT}/${process.env.DDB_NAME}`,
  {
    maxPoolSize: 10,
  },
);

console.log(`Created MongoDB Pool.`);

export default mongoPool;
