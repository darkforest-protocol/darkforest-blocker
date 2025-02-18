import { IncomingMessage, ServerResponse } from 'http';
import { createBlocker } from '../core/blockers';
import { BlockerConfig, GenericRequest, GenericResponse } from '../core/types';

/**
 * Creates a Node.js HTTP server request handler for blocking user agents
 * @param config Configuration options
 * @returns Node.js HTTP request handler
 */
export function createNodeBlocker(config: BlockerConfig) {
  const blocker = createBlocker(config);

  return function nodeHandler(
    req: IncomingMessage,
    res: ServerResponse,
    next?: () => void
  ) {
    // Adapt Node.js request to generic request
    const genericReq: GenericRequest = {
      userAgent: req.headers['user-agent'] || ''
    };

    // Adapt Node.js response to generic response
    const genericRes: GenericResponse = {
      redirect: (url: string) => {
        res.writeHead(302, { Location: url });
        res.end();
      },
      json: (statusCode: number, body: any) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(body));
      },
      send: (statusCode: number, body: string) => {
        res.writeHead(statusCode);
        res.end(body);
      }
    };

    // If no next function provided, create a dummy one
    const nextFn = next || (() => {});

    return blocker(genericReq, genericRes, nextFn);
  };
}

/**
 * Example usage with Node.js HTTP server:
 * 
 * const http = require('http');
 * const { createNodeBlocker } = require('darkforest-blocker/node');
 * 
 * const blocker = createNodeBlocker({
 *   blockedUserAgents: ['bad-bot']
 * });
 * 
 * const server = http.createServer((req, res) => {
 *   blocker(req, res, () => {
 *     // Your normal request handling here
 *     res.end('Hello World!');
 *   });
 * });
 * 
 * server.listen(3000);
 */
