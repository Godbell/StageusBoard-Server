import { logSchema } from '../models/log';
import mongoPool from './mongoPool';

export const log = async ({ ip, userIdx, path, method }) => {
  const result = await mongoPool.model('log', logSchema).insertMany({
    ip,
    userIdx,
    path,
    method,
  });

  return result;
};
