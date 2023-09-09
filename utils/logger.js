import { logSchema } from '../models/log.js';
import mongoPool from './mongoPool.js';

export const log = async (req) => {
  const connection = mongoPool.useDb('stageus');
  const { ip, userIdx, path, method } = req;

  try {
    result = await connection.model('log', logSchema).insertMany({
      ip,
      userIdx,
      path,
      method,
    });
  } catch (e) {
    throw e;
  } finally {
    connection.close();
  }

  return result;
};
