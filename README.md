# DarkForest Protocol v0

A lightweight application-level middleware to block and redirect AI search bots. Compatible with multiple Node.js web frameworks.

## Installation

```bash
npm install darkforest-blocker
```

## Usage

### Express.js

```javascript
const express = require('express');
const uaBlocker = require('darkforest-blocker');

const app = express();

app.use(uaBlocker({
  blockedUserAgents: ['bad-bot', 'scraper'],
  redirectUrl: 'https://example.com/blocked'  // optional
}));
```

### Next.js

Create a middleware file (```src/middleware.ts``` or ```pages/_middleware.ts``` depending on your Next.js version):

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { uaBlocker } from 'darkforest-blocker';

export function middleware(request: NextRequest) {
  const blocker = uaBlocker({
    blockedUserAgents: ['bad-bot', 'scraper'],
    redirectUrl: '/blocked'
  });

  // Handle the request
  const userAgent = request.headers.get('user-agent') || '';
  const isBlocked = blocker.isBlocked(userAgent);

  if (isBlocked) {
    return NextResponse.redirect(new URL('/blocked', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: '/((?!api|_next/static|favicon.ico).*)',
};
```

### Koa.js

```javascript
const Koa = require('koa');
const uaBlocker = require('darkforest-blocker');

const app = new Koa();

app.use(async (ctx, next) => {
  const blocker = uaBlocker({
    blockedUserAgents: ['bad-bot', 'scraper'],
    redirectUrl: '/blocked'
  });

  if (blocker.isBlocked(ctx.request.headers['user-agent'])) {
    ctx.redirect('/blocked');
    return;
  }

  await next();
});
```

### Fastify

```javascript
const fastify = require('fastify');
const uaBlocker = require('darkforest-blocker');

const app = fastify();

app.addHook('onRequest', async (request, reply) => {
  const blocker = uaBlocker({
    blockedUserAgents: ['bad-bot', 'scraper'],
    redirectUrl: '/blocked'
  });

  if (blocker.isBlocked(request.headers['user-agent'])) {
    return reply.redirect('/blocked');
  }
});
```

### NestJS

```typescript
// ua-blocker.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { uaBlocker } from 'darkforest-blocker';

@Injectable()
export class UaBlockerMiddleware implements NestMiddleware {
  private blocker = uaBlocker({
    blockedUserAgents: ['bad-bot', 'scraper'],
    redirectUrl: '/blocked'
  });

  use(req: Request, res: Response, next: NextFunction) {
    if (this.blocker.isBlocked(req.headers['user-agent'])) {
      return res.redirect('/blocked');
    }
    next();
  }
}

// app.module.ts
@Module({
  // ...
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UaBlockerMiddleware)
      .forRoutes('*');
  }
}
```

## Options

- `blockedUserAgents`: Array of strings or regular expressions to match against user agents
- `redirectURL`?: Optional URL to redirect blocked requests to, defaults to ...
- `statusCode`?: Optional HTTP status code for blocked requests (default: 403)


## Response

Blocked requests receive a 403 status code with JSON response:
```json
{
  "error": "Access denied based on User-Agent"
}
```

## Security Considerations 

This package works only at the application level, after the request reaches your server. For production environments, consider combining with your reverse proxy engine of choice. 

DarkForest Nginx/Apache config integrations are in development. 

Please let us know if you have further requests! ```hello@darkestforest.xyz```


