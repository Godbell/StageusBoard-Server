import { logSchema } from '../models/log.js';
import mongoPool from './mongoPool.js';

export const log = async ({ ip, userIdx, url, method }) => {
  const connection = mongoPool.useDb('stageus');

  try {
    const result = await connection.model('log', logSchema).insertMany({
      ip,
      userIdx,
      url,
      method,
    });
    return result;
  } catch (e) {
    throw e;
  }
};
