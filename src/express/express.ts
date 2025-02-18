import { Request, Response, NextFunction } from 'express';
import { createBlocker } from '../core/blockers';
import { BlockerConfig, GenericRequest, GenericResponse } from '../core/types';

/**
 * Creates an Express-compatible middleware for blocking user agents
 * @param config Configuration options
 * @returns Express middleware function
 */
export function createExpressBlocker(config: BlockerConfig) {
  const blocker = createBlocker(config);

  return function expressMiddleware(req: Request, res: Response, next: NextFunction) {
    // Adapt Express request to generic request
    const genericReq: GenericRequest = {
      userAgent: req.headers['user-agent'] || ''
    };

    // Adapt Express response to generic response
    const genericRes: GenericResponse = {
      redirect: (url: string) => res.redirect(url),
      json: (statusCode: number, body: any) => res.status(statusCode).json(body),
      send: (statusCode: number, body: string) => res.status(statusCode).send(body)
    };

    return blocker(genericReq, genericRes, next);
  };
}
