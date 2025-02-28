import { BlockerPresetCategory } from './presets';

/**
 * Configuration options for the DarkForest blocker
 */
export interface BlockerConfig {
  /** Array of preset categories to block */
  presetCategories?: BlockerPresetCategory[];
  /** Array of custom user agent strings or patterns to block */
  customBlockedUserAgents?: string[];
  /** Optional URL to redirect blocked requests to */
  redirectUrl?: string;
  /** HTTP status code for blocked requests (defaults to 403) */
  statusCode?: number;
  /** Array of path patterns that should be exempt from blocking */
  exemptPaths?: string[];
}

/**
 * Core response interface for blocked requests
 */
export interface BlockResponse {
  /** Whether the request should be blocked */
  isBlocked: boolean;
  /** HTTP status code to use if blocked */
  statusCode: number;
  /** Redirect URL if specified */
  redirectUrl?: string;
  /** Error message for JSON responses */
  error?: string;
}

/**
 * Generic request interface that adapters will map to
 */
export interface GenericRequest {
  /** User agent string from request headers */
  userAgent: string;
  /** Request path */
  path: string;
}

/**
 * Generic response interface that adapters will implement
 */
export interface GenericResponse {
  /** Send a redirect response */
  redirect(url: string): void;
  /** Send a JSON response with status code */
  json(statusCode: number, body: any): void;
  /** Send a raw response with status code */
  send(statusCode: number, body: string): void;
}

/**
 * Generic next function for middleware chains
 */
export type NextFunction = () => void | Promise<void>;
