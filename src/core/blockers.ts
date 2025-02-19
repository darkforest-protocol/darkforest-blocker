import { BlockerConfig, BlockResponse, GenericRequest, GenericResponse, NextFunction } from './types';
import { getPatternsForPresets } from './presets';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<BlockerConfig> = {
  statusCode: 403,
  exemptPaths: [],
};

/**
 * Default error message for blocked requests
 */
const DEFAULT_ERROR_MESSAGE = 'You have been blocked by DarkForest Protocol. Visit https://www.darkestforest.xyz/ai-agents to learn more.';

/**
 * Validates the blocker configuration
 * @param config User provided configuration
 * @throws Error if configuration is invalid
 */
function validateConfig(config: BlockerConfig): void {
  // Must provide either preset categories or custom patterns
  if (!config.presetCategories && !config.customBlockedUserAgents) {
    throw new Error('Must provide either presetCategories or customBlockedUserAgents');
  }

  if (config.presetCategories && !Array.isArray(config.presetCategories)) {
    throw new Error('presetCategories must be an array if provided');
  }

  if (config.customBlockedUserAgents && !Array.isArray(config.customBlockedUserAgents)) {
    throw new Error('customBlockedUserAgents must be an array if provided');
  }

  if (config.redirectUrl !== undefined && typeof config.redirectUrl !== 'string') {
    throw new Error('redirectUrl must be a string if provided');
  }

  if (config.statusCode !== undefined && typeof config.statusCode !== 'number') {
    throw new Error('statusCode must be a number if provided');
  }

  if (config.exemptPaths !== undefined && !Array.isArray(config.exemptPaths)) {
    throw new Error('exemptPaths must be an array if provided');
  }
}

/**
 * Gets all user agent patterns to block from config
 * @param config User provided configuration
 * @returns Array of user agent patterns to block
 */
function getAllPatterns(config: BlockerConfig): string[] {
  const presetPatterns = config.presetCategories ? getPatternsForPresets(config.presetCategories) : [];
  const customPatterns = config.customBlockedUserAgents || [];
  return [...presetPatterns, ...customPatterns];
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
 * @param path Request path
 * @param patterns Compiled RegExp patterns to match against
 * @param exemptPatterns Compiled RegExp patterns for exempt paths
 * @returns true if request should be blocked, false otherwise
 */
function shouldBlock(
  userAgent: string,
  path: string,
  patterns: RegExp[],
  exemptPatterns: RegExp[]
): boolean {
  // Check if path is exempt first
  if (exemptPatterns.some(pattern => pattern.test(path))) {
    return false;
  }
  // Then check if user agent is blocked
  return patterns.some(pattern => pattern.test(userAgent));
}

type FinalConfig = Required<Pick<BlockerConfig, 'statusCode' | 'exemptPaths'>> & 
  Omit<BlockerConfig, 'statusCode' | 'exemptPaths'>;

/**
 * Creates a block response object based on configuration
 * @param config Blocker configuration with defaults
 * @param isBlocked Whether the request is blocked
 * @returns Block response object
 */
function createBlockResponse(config: FinalConfig, isBlocked: boolean): BlockResponse {
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
  const finalConfig: FinalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    redirectUrl: config.redirectUrl || undefined,
    exemptPaths: config.exemptPaths || [],
    statusCode: config.statusCode || DEFAULT_CONFIG.statusCode as number
  };

  // Get all patterns and compile once at creation
  const patterns = compilePatterns(getAllPatterns(config));
  const exemptPatterns = compilePatterns(finalConfig.exemptPaths);

  /**
   * Core blocking function that adapters will wrap
   * @param req Generic request object
   * @param res Generic response object
   * @param next Next function in middleware chain
   */
  return function blocker(req: GenericRequest, res: GenericResponse, next: NextFunction) {
    const response = createBlockResponse(
      finalConfig,
      shouldBlock(req.userAgent, req.path, patterns, exemptPatterns)
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
