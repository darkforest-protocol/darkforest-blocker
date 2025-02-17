// index.js

/**
 * Creates middleware for blocking specific user agents
 * @param {Object} options Configuration options
 * @param {string[]} options.blockedUserAgents Array of user agent strings to block
 * @returns {Function} Express middleware function
 */
function darkforestblocker(options = {}) {
    const config = {
      blockedUserAgents: [],
      ...options
    };
  
    if (!Array.isArray(config.blockedUserAgents)) {
      throw new Error('blockedUserAgents must be an array');
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
  
      // Block the request
      res.status(403).json({
        error: 'Access denied based on User-Agent'
      });
    };
  }
  
  module.exports = darkforestblocker;