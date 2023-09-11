import { Router } from 'express';
import asyncify from 'express-asyncify';
import mongoPool from '../utils/mongoPool.js';
import { logSchema } from '../models/log.js';
import escapeStringRegexp from 'escape-string-regexp';

export const logRouter = asyncify(Router());

logRouter.get('/', async (req, res) => {
  const startDate = new Date(req.query.startDate ?? 0);
  const endDate = new Date(req.query.endDate ?? 0);
  const { ip, method, url } = req.query;

  const result = await mongoPool
    .model('log', logSchema)
    .find({
      created_at: {
        $gte: startDate,
        $lte: endDate,
      },
      ip: {
        $regex: ip ? `(.+)?${escapeStringRegexp(ip)}(.+)?` : '',
      },
      method: {
        $regex: method ? `(.+)?${escapeStringRegexp(method)}(.+)?` : '',
      },
      url: {
        $regex: url ? `(.+)?${escapeStringRegexp(url)}(.+)?` : '',
      },
    })
    .exec();

  res.json(result);
});
