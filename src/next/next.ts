import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import { createBlocker } from '../core/blockers';
import { BlockerConfig, GenericRequest, GenericResponse } from '../core/types';

/**
 * Creates a Next.js middleware for blocking user agents
 * @param config Configuration options
 * @returns Next.js middleware function
 */
export function createNextMiddleware(config: BlockerConfig) {
  const blocker = createBlocker(config);

  return async function nextMiddleware(req: NextRequest) {
    return new Promise<NextResponse | undefined>((resolve) => {
      // Adapt Next.js request to generic request
      const genericReq: GenericRequest = {
        userAgent: req.headers.get('user-agent') || '',
        path: req.nextUrl.pathname
      };

      // Adapt Next.js response to generic response
      const genericRes: GenericResponse = {
        redirect: (url: string) => resolve(NextResponse.redirect(new URL(url))),
        json: (statusCode: number, body: any) => 
          resolve(new NextResponse(JSON.stringify(body), { 
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
          })),
        send: (statusCode: number, body: string) => 
          resolve(new NextResponse(body, { status: statusCode }))
      };

      // Next function for middleware chain
      const next = () => resolve(undefined);

      blocker(genericReq, genericRes, next);
    });
  };
}

/**
 * Creates a Next.js API route handler for blocking user agents
 * @param config Configuration options
 * @returns Next.js API route handler
 */
export function createNextApiHandler(config: BlockerConfig) {
  const blocker = createBlocker(config);

  return async function nextApiHandler(
    req: NextApiRequest,
    res: NextApiResponse,
    next?: () => void
  ) {
    // Adapt Next.js API request to generic request
    const genericReq: GenericRequest = {
      userAgent: req.headers['user-agent'] as string || '',
      path: req.url || '/'
    };

    // Adapt Next.js API response to generic response
    const genericRes: GenericResponse = {
      redirect: (url: string) => res.redirect(url),
      json: (statusCode: number, body: any) => res.status(statusCode).json(body),
      send: (statusCode: number, body: string) => res.status(statusCode).send(body)
    };

    // If no next function provided, create a dummy one
    const nextFn = next || (() => {});

    return blocker(genericReq, genericRes, nextFn);
  };
}

/**
 * Creates a Next.js blocker that can be used as either middleware or API handler
 * @param config Configuration options
 * @returns Object containing both middleware and API handler
 */
export function createNextBlocker(config: BlockerConfig) {
  return {
    middleware: createNextMiddleware(config),
    apiHandler: createNextApiHandler(config)
  };
}
