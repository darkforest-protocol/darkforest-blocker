# DarkForest Protocol v0

Simple Express middleware to block specific user agents.

## Installation

```bash
npm install simple-ua-blocker
```

## Usage

```javascript
const express = require('express');
const uaBlocker = require('simple-ua-blocker');

const app = express();

app.use(uaBlocker({
  blockedUserAgents: [
    'bad-bot',
    'scraper',
    '^Mozilla/5.0 \\(compatible; BadBot/2.1;'
  ]
}));
```

## Options

- `blockedUserAgents`: Array of strings or regular expressions to match against user agents

## Response

Blocked requests receive a 403 status code with JSON response:
```json
{
  "error": "Access denied based on User-Agent"
}
```

## License

MIT