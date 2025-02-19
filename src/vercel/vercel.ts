import { NextRequest, NextResponse } from 'next/server';
import { createBlocker } from '../core/blockers';
import { BlockerConfig, GenericRequest, GenericResponse } from '../core/types';

/**
 * Creates a Vercel Edge Middleware for blocking user agents
 * @param config Configuration options
 * @returns Vercel Edge Middleware function
 */
export function createVercelMiddleware(config: BlockerConfig) {
  const blocker = createBlocker(config);

  return async function vercelMiddleware(req: NextRequest) {
    return new Promise<NextResponse>((resolve) => {
      // Adapt Vercel request to generic request
      const genericReq: GenericRequest = {
        userAgent: req.headers.get('user-agent') || '',
        path: new URL(req.url).pathname
      };

      // Adapt Vercel response to generic response
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
      const next = () => resolve(NextResponse.next());

      blocker(genericReq, genericRes, next);
    });
  };
}
