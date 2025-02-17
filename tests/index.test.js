// test/index.test.js
const { expect } = require('chai');
const uaBlocker = require('../index');

describe('uaBlocker', () => {
  it('should create middleware function', () => {
    const middleware = uaBlocker({ blockedUserAgents: [] });
    expect(middleware).to.be.a('function');
  });

  it('should throw error if blockedUserAgents is not an array', () => {
    expect(() => uaBlocker({ blockedUserAgents: 'bad-bot' }))
      .to.throw('blockedUserAgents must be an array');
  });

  it('should throw error if redirectUrl is not a string', () => {
    expect(() => uaBlocker({ 
      blockedUserAgents: ['bad-bot'],
      redirectUrl: 123 
    })).to.throw('redirectUrl must be a string if provided');
  });

  describe('when blocking without redirect', () => {
    it('should block matching user agents with JSON response', (done) => {
      const middleware = uaBlocker({
        blockedUserAgents: ['bad-bot']
      });

      const req = {
        headers: {
          'user-agent': 'bad-bot/1.0'
        }
      };

      const res = {
        status: function(code) {
          expect(code).to.equal(403);
          return this;
        },
        json: function(data) {
          expect(data).to.have.property('error');
          done();
        }
      };

      middleware(req, res, () => {
        done(new Error('next() should not be called'));
      });
    });
  });

  describe('when blocking with redirect', () => {
    it('should redirect matching user agents', (done) => {
      const redirectUrl = 'https://example.com/blocked';
      const middleware = uaBlocker({
        blockedUserAgents: ['bad-bot'],
        redirectUrl
      });

      const req = {
        headers: {
          'user-agent': 'bad-bot/1.0'
        }
      };

      const res = {
        redirect: function(url) {
          expect(url).to.equal(redirectUrl);
          done();
        }
      };

      middleware(req, res, () => {
        done(new Error('next() should not be called'));
      });
    });
  });

  it('should allow non-matching user agents', (done) => {
    const middleware = uaBlocker({
      blockedUserAgents: ['bad-bot'],
      redirectUrl: 'https://example.com/blocked'
    });

    const req = {
      headers: {
        'user-agent': 'good-bot/1.0'
      }
    };

    middleware(req, {}, done);
  });

  it('should handle missing user-agent header', (done) => {
    const middleware = uaBlocker({
      blockedUserAgents: ['bad-bot']
    });

    const req = {
      headers: {}
    };

    middleware(req, {}, done);
  });
});