import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ips.length ? req.ips[0] : req.ip;
    const { method, originalUrl, httpVersion } = req;
    const userAgent = req.get('user-agent') || '';
    res.on('finish', () => {
      const { statusCode } = res;
      Logger.log(`[${ip}] ${method} ${statusCode} ${originalUrl} HTTP/${httpVersion} ${userAgent}`, 'HttpLoggerMiddleware');
    });
    next();
  }
}
