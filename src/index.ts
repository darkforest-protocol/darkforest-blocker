import { createBlocker } from './core/blockers';
import { BlockerConfig } from './core/types';
import { createExpressBlocker } from './express/express';
import { createNextBlocker } from './next/next';
import { createNodeBlocker } from './node/node';
import { createViteBlocker } from './vite/vite';
import { createVercelMiddleware } from './vercel/vercel';

// Export core functionality
export { createBlocker };
export type { BlockerConfig };

// Export framework-specific adapters
export { createExpressBlocker } from './express/express';
export { createNextBlocker } from './next/next';
export { createNodeBlocker } from './node/node';
export { createViteBlocker } from './vite/vite';
export { createVercelMiddleware } from './vercel/vercel';

// Default export for backward compatibility with current Express middleware
export default createExpressBlocker;

// Framework-specific exports
export const express = { createExpressBlocker };
export const next = { createNextBlocker };
export const node = { createNodeBlocker };
export const vite = { createViteBlocker };
export const vercel = { createVercelMiddleware };
