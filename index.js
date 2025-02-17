// index.js

/**
 * Creates middleware for blocking specific user agents
 * @param {Object} options Configuration options
 * @param {string[]} options.blockedUserAgents Array of user agent strings to block
 * @param {string} [options.redirectUrl] URL to redirect blocked requests to (optional)
 * @param {number} [options.statusCode=403] HTTP status code for blocked requests
 * @returns {Function} Express middleware function
 */
function darkforestblocker(options = {}) {
    const config = {
      blockedUserAgents: [],
      redirectUrl: null,
      statusCode: 403,
      ...options
    };
  
    if (!Array.isArray(config.blockedUserAgents)) {
      throw new Error('blockedUserAgents must be an array');
    }

    // Validate redirect URL if provided
    if (config.redirectUrl !== null && typeof config.redirectUrl !== 'string') {
      throw new Error('redirectUrl must be a string if provided');
    }
    
    // Compile regex patterns for matching
    const patterns = config.blockedUserAgents.map(ua => {
      try {
        return new RegExp(ua, 'i');
      } catch (err) {
        throw new Error(`Invalid user agent pattern: ${ua}`);
      }
    });
  
    return function middleware(req, res, next) {
      const userAgent = req.headers['user-agent'] || '';
  
      // Check if user agent matches any blocked pattern
      const isBlocked = patterns.some(pattern => pattern.test(userAgent));
  
      if (!isBlocked) {
        return next();
      }
  
        // Handle blocked request
      if (config.redirectUrl) {
        // Perform redirect if URL is specified
        return res.redirect(config.redirectUrl);
      }

      // Default blocking behavior
      return res.status(config.statusCode).json({
        error: 'You have been blocked by DarkForest Protocol. Visit https://www.darkestforest.xyz/ to learn more.'
      });
    };
  }
  
  module.exports = darkforestblocker;