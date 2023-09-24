import { Router } from 'express';
import asyncify from 'express-asyncify';
import mongoPool from '../utils/mongoPool.js';
import { logSchema } from '../models/log.js';
import escapeStringRegexp from 'escape-string-regexp';
import { verifyToken } from '../utils/auth.js';

export const logRouter = asyncify(Router());

logRouter.get('/', async (req, res) => {
  const token = verifyToken(req.cookies.token, 'userIdx');

  if (token.isAdmin === false) {
    throw {
      status: 401,
      message: 'unauthorized',
    };
  }

  const startDate = new Date(req.query.startDate ?? 0);
  const endDate = new Date(req.query.endDate ?? 0);
  const {
    ip = '',
    method = '',
    url = '',
    orderBy = 'created_at',
    orderPriority = 'ASC',
  } = req.query;

  if (orderBy === '' || !['ASC', 'DSC'].includes(orderPriority)) {
    throw {
      status: 400,
      message: 'not found',
    };
  }

  const result = await mongoPool
    .model('log', logSchema)
    .find({
      created_at: {
        $gte: startDate,
        $lte: endDate,
      },
      ip: {
        $regex: `(.+)?${escapeStringRegexp(ip)}(.+)?`,
      },
      method: {
        $regex: method ? `(.+)?${escapeStringRegexp(method)}(.+)?` : '',
      },
      url: {
        $regex: url ? `(.+)?${escapeStringRegexp(url)}(.+)?` : '',
      },
    })
    .sort({
      [orderBy]: orderPriority === 'ASC' ? 1 : -1,
    })
    .exec();

  res.locals.result = result;
  res.json(result);
});
