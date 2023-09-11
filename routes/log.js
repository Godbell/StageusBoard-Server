import { Router } from 'express';
import asyncify from 'express-asyncify';
import mongoPool from '../utils/mongoPool.js';
import { logSchema } from '../models/log.js';

export const logRouter = asyncify(Router());

logRouter.get('/', async (req, res) => {
  const startDate = new Date(req.query.startDate ?? 0);
  const endDate = new Date(req.query.endDate ?? 0);

  const result = (
    await mongoPool
      .model('log', logSchema)
      .find({
        created_at: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .exec()
  ).map((log) => {
    log.ip, log.method, log.url, log.created_at;
  });

  res.json(result);
});
