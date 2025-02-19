# DarkForest Blocker

A framework-agnostic middleware for blocking specific user agents at the application level. Supports Express.js, Next.js, Node.js HTTP, and Vite.

## Features

- 🛡️ Block specific user agents using preset categories or custom patterns
  - We use [ai.robots.txt](https://github.com/ai-robots-txt/ai.robots.txt/blob/main/table-of-bot-metrics.md) to provide 46 AI-related user-agents to block.
- 🔄 Redirect blocked requests to a specified URL
- 🎯 Customizable HTTP status codes
- 🔌 Framework adapters for:
  - Express.js
  - Next.js (Middleware & API Routes)
  - Node.js HTTP/HTTPS
  - Vite Dev Server
  - Vercel Edge Middleware

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
  // Use preset categories
  presetCategories: ['ai-search-bots', 'ai-crawl-bots'],
  // Optionally add custom patterns
  customBlockedUserAgents: ['additional-bot-pattern'],
  redirectUrl: 'https://example.com/blocked',  // Optional
  statusCode: 403  // Optional, defaults to 403
}));
```

### Next.js

#### Middleware (app directory or pages/_middleware.ts)

```typescript
import { createNextBlocker } from 'darkforest-blocker/next';

const { middleware } = createNextBlocker({
  presetCategories: ['ai-search-bots']
});

export default middleware;
```

#### API Routes

```typescript
import { createNextBlocker } from 'darkforest-blocker/next';

const { apiHandler } = createNextBlocker({
  presetCategories: ['ai-search-bots'],
  customBlockedUserAgents: ['custom-bot']
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
  presetCategories: ['ai-search-bots', 'ai-crawl-bots']
});

const server = http.createServer((req, res) => {
  blocker(req, res, () => {
    // Your request handling logic here
    res.end('Hello World!');
  });
});

server.listen(3000);
```

### Vercel Edge Middleware

```typescript
// middleware.ts
import { createVercelMiddleware } from 'darkforest-blocker/vercel';

export const middleware = createVercelMiddleware({
  presetCategories: ['ai-search-bots'],
  redirectUrl: '/blocked',  // Optional
  statusCode: 403  // Optional, defaults to 403
});
```

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { createViteBlocker } from 'darkforest-blocker/vite';

export default defineConfig({
  plugins: [
    createViteBlocker({
      presetCategories: ['ai-search-bots']
    })
  ]
});
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| presetCategories | string[] | No* | - | Array of preset categories to block ('ai-search-bots', 'ai-crawl-bots') |
| customBlockedUserAgents | string[] | No* | - | Array of custom user agent strings or regex patterns to block |
| redirectUrl | string | No | null | URL to redirect blocked requests to |
| statusCode | number | No | 403 | HTTP status code for blocked requests |
| exemptPaths | string[] | No | [] | Array of path patterns that should be exempt from blocking |

\* Either `presetCategories` or `customBlockedUserAgents` must be provided

## Preset Categories

The package includes predefined categories of user agents to block:

- `ai-search-bots`: Common AI-powered search engine bots
- `ai-crawl-bots`: AI-powered web crawlers and scrapers

You can use these categories alone or combine them with custom patterns:

```typescript
createExpressBlocker({
  // Use both preset categories
  presetCategories: ['ai-search-bots', 'ai-crawl-bots'],
  // Add your own patterns
  customBlockedUserAgents: [
    'custom-bot',
    'specific-crawler'
  ]
});
```

## Path Exemption

The `exemptPaths` option allows you to specify paths that should be exempt from blocking, even if the user agent matches a blocked pattern. 

WARNING: If redirecting to any path `/redirected_to` on your site, you must add `/redirected_to` to `exemptPaths`! (Or else the user-agent will enter an infinite redirect loop)

```typescript
createExpressBlocker({
  presetCategories: ['ai-search-bots'],
  exemptPaths: [
    '^/health$',        // Exact match for /health
    '^/api/public/.*',  // Any path starting with /api/public/
    '/callback$'        // Any path ending with /callback
  ]
});
```

Path patterns are treated as regular expressions, so you can use regex patterns to match multiple paths or create more complex matching rules.

## Response Handling

When a request is blocked:

1. If `redirectUrl` is provided:
   - The request will be redirected to the specified URL (i.e., an AI landing page)

2. If no `redirectUrl` is provided:
   - Returns a JSON response with:
     - HTTP status code (default: 403)
     - Error message explaining the block

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
