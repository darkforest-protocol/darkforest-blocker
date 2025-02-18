import { BlockerConfig, BlockResponse, GenericRequest, GenericResponse, NextFunction } from './types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<BlockerConfig> = {
  statusCode: 403,
};

/**
 * Default error message for blocked requests
 */
const DEFAULT_ERROR_MESSAGE = 'You have been blocked by DarkForest Protocol. Visit https://www.darkestforest.xyz/ to learn more.';

/**
 * Validates the blocker configuration
 * @param config User provided configuration
 * @throws Error if configuration is invalid
 */
function validateConfig(config: BlockerConfig): void {
  if (!Array.isArray(config.blockedUserAgents)) {
    throw new Error('blockedUserAgents must be an array');
  }

  if (config.redirectUrl !== undefined && typeof config.redirectUrl !== 'string') {
    throw new Error('redirectUrl must be a string if provided');
  }

  if (config.statusCode !== undefined && typeof config.statusCode !== 'number') {
    throw new Error('statusCode must be a number if provided');
  }
}

/**
 * Compiles user agent patterns into RegExp objects
 * @param patterns Array of user agent patterns
 * @returns Array of compiled RegExp objects
 */
function compilePatterns(patterns: string[]): RegExp[] {
  return patterns.map(pattern => {
    try {
      return new RegExp(pattern, 'i');
    } catch (err) {
      throw new Error(`Invalid user agent pattern: ${pattern}`);
    }
  });
}

/**
 * Core blocking logic that determines if a request should be blocked
 * @param userAgent User agent string from request
 * @param patterns Compiled RegExp patterns to match against
 * @returns true if request should be blocked, false otherwise
 */
function shouldBlock(userAgent: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(userAgent));
}

/**
 * Creates a block response object based on configuration
 * @param config Blocker configuration
 * @param isBlocked Whether the request is blocked
 * @returns Block response object
 */
function createBlockResponse(config: Required<BlockerConfig>, isBlocked: boolean): BlockResponse {
  if (!isBlocked) {
    return { isBlocked, statusCode: 200 };
  }

  return {
    isBlocked,
    statusCode: config.statusCode,
    redirectUrl: config.redirectUrl,
    error: DEFAULT_ERROR_MESSAGE
  };
}

/**
 * Creates the core blocker function that adapters will use
 * @param config User provided configuration
 * @returns Function that implements core blocking logic
 */
export function createBlocker(config: BlockerConfig) {
  // Validate and merge with defaults
  validateConfig(config);
  const finalConfig: Required<BlockerConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
    redirectUrl: config.redirectUrl || undefined
  } as Required<BlockerConfig>;

  // Compile patterns once at creation
  const patterns = compilePatterns(finalConfig.blockedUserAgents);

  /**
   * Core blocking function that adapters will wrap
   * @param req Generic request object
   * @param res Generic response object
   * @param next Next function in middleware chain
   */
  return function blocker(req: GenericRequest, res: GenericResponse, next: NextFunction) {
    const response = createBlockResponse(
      finalConfig,
      shouldBlock(req.userAgent, patterns)
    );

    if (!response.isBlocked) {
      return next();
    }

    if (response.redirectUrl) {
      return res.redirect(response.redirectUrl);
    }

    return res.json(response.statusCode, { error: response.error });
  };
}
