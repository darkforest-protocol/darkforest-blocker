import type { Plugin, Connect, PluginOption } from 'vite';
import type { ServerResponse } from 'http';
import { createBlocker } from '../core/blockers';
import { BlockerConfig, GenericRequest, GenericResponse } from '../core/types';

/**
 * Creates a Vite plugin for blocking user agents
 * @param config Configuration options
 * @returns Vite plugin
 */
export function createViteBlocker(config: BlockerConfig): PluginOption {
  const blocker = createBlocker(config);

  return {
    name: 'vite-plugin-darkforest-blocker',
    configureServer(server) {
      server.middlewares.use((req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        // Adapt Connect request to generic request
        const genericReq: GenericRequest = {
          userAgent: req.headers['user-agent'] || '',
          path: req.url || '/'
        };

        // Adapt Connect response to generic response
        const genericRes: GenericResponse = {
          redirect: (url: string) => {
            res.statusCode = 302;
            res.setHeader('Location', url);
            res.end();
          },
          json: (statusCode: number, body: any) => {
            res.statusCode = statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(body));
          },
          send: (statusCode: number, body: string) => {
            res.statusCode = statusCode;
            res.end(body);
          }
        };

        return blocker(genericReq, genericRes, next);
      });
    }
  };
}

/**
 * Example usage in vite.config.js/ts:
 * 
 * import { defineConfig } from 'vite';
 * import { createViteBlocker } from 'darkforest-blocker/vite';
 * 
 * export default defineConfig({
 *   plugins: [
 *     createViteBlocker({
 *       blockedUserAgents: ['bad-bot']
 *     })
 *   ]
 * });
 */
