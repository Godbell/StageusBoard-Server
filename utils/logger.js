import { logSchema } from '../models/log.js';
import mongoPool from './mongoPool.js';

export const log = async ({ ip, userIdx, url, method, response }) => {
  const connection = mongoPool.useDb('stageus');

  try {
    const result = await connection.model('log', logSchema).insertMany({
      ip,
      userIdx,
      url,
      method,
      response,
    });
    return result;
  } catch (e) {
    throw e;
  }
};
