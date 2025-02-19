import { createBlocker } from '../core/blockers';
import type { BlockerConfig, GenericRequest, GenericResponse } from '../core/types';

/**
 * Creates a Vercel Edge Functions middleware for blocking user agents
 * @param config Configuration options
 * @returns Edge Functions middleware function
 */
export function createEdgeMiddleware(config: BlockerConfig) {
  const blocker = createBlocker(config);

  return async function edgeMiddleware(request: Request): Promise<Response | undefined> {
    return new Promise<Response | undefined>((resolve) => {
      // Extract URL and pathname
      const url = new URL(request.url);
      
      // Adapt web Request to generic request
      const genericReq: GenericRequest = {
        userAgent: request.headers.get('user-agent') || '',
        path: url.pathname
      };

      // Adapt web Response to generic response
      const genericRes: GenericResponse = {
        redirect: (redirectUrl: string) => {
          // Construct absolute URL if relative path provided
          const absoluteUrl = redirectUrl.startsWith('http') 
            ? redirectUrl 
            : new URL(redirectUrl, url.origin).toString();
            
          resolve(Response.redirect(absoluteUrl, 302));
        },
        json: (statusCode: number, body: any) => 
          resolve(new Response(JSON.stringify(body), { 
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
          })),
        send: (statusCode: number, body: string) => 
          resolve(new Response(body, { status: statusCode }))
      };

      // Next function for middleware chain - return undefined to continue middleware chain
      const next = () => resolve(undefined as any);

      blocker(genericReq, genericRes, next);
    });
  };
}
