# DarkForest Blocker

A framework-agnostic middleware for blocking specific user agents at the application level. Supports Express.js, Next.js, Node.js HTTP, and Vite.

## Features

- 🛡️ Block specific user agents using regex patterns
- 🔄 Redirect blocked requests to a specified URL
- 🎯 Customizable HTTP status codes
- 🔌 Framework adapters for:
  - Express.js
  - Next.js (Middleware & API Routes)
  - Node.js HTTP/HTTPS
  - Vite Dev Server

## Installation

```bash
npm install darkforest-blocker
```

## Usage

### Express.js

```typescript
import express from 'express';
import { createExpressBlocker } from 'darkforest-blocker/express';

const app = express();

app.use(createExpressBlocker({
  blockedUserAgents: ['bad-bot', 'malicious-crawler'],
  redirectUrl: 'https://example.com/blocked',  // Optional
  statusCode: 403  // Optional, defaults to 403
}));
```

### Next.js

#### Middleware (app directory or pages/_middleware.ts)

```typescript
import { createNextBlocker } from 'darkforest-blocker/next';

const { middleware } = createNextBlocker({
  blockedUserAgents: ['bad-bot']
});

export default middleware;
```

#### API Routes

```typescript
import { createNextBlocker } from 'darkforest-blocker/next';

const { apiHandler } = createNextBlocker({
  blockedUserAgents: ['bad-bot']
});

export default function handler(req, res) {
  return apiHandler(req, res, () => {
    // Your API route logic here
    res.status(200).json({ message: 'Hello World' });
  });
}
```

### Node.js HTTP

```typescript
import http from 'http';
import { createNodeBlocker } from 'darkforest-blocker/node';

const blocker = createNodeBlocker({
  blockedUserAgents: ['bad-bot']
});

const server = http.createServer((req, res) => {
  blocker(req, res, () => {
    // Your request handling logic here
    res.end('Hello World!');
  });
});

server.listen(3000);
```

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { createViteBlocker } from 'darkforest-blocker/vite';

export default defineConfig({
  plugins: [
    createViteBlocker({
      blockedUserAgents: ['bad-bot']
    })
  ]
});
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| blockedUserAgents | string[] | Yes | - | Array of user agent strings or regex patterns to block |
| redirectUrl | string | No | null | URL to redirect blocked requests to |
| statusCode | number | No | 403 | HTTP status code for blocked requests |

## Response Handling

When a request is blocked:

1. If `redirectUrl` is provided:
   - The request will be redirected to the specified URL

2. If no `redirectUrl` is provided:
   - Returns a JSON response with:
     - HTTP status code (default: 403)
     - Error message explaining the block

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
