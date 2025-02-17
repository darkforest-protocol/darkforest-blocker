// test/index.test.js
const { expect } = require('chai');
const darkforestblocker = require('../index');

describe('darkforestblocker', () => {
  it('should create middleware function', () => {
    const middleware = darkforestblocker({ blockedUserAgents: [] });
    expect(middleware).to.be.a('function');
  });

  it('should throw error if blockedUserAgents is not an array', () => {
    expect(() => darkforestblocker({ blockedUserAgents: 'bad-bot' }))
      .to.throw('blockedUserAgents must be an array');
  });

  it('should block matching user agents', (done) => {
    const middleware = darkforestblocker({
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

  it('should allow non-matching user agents', (done) => {
    const middleware = darkforestblocker({
      blockedUserAgents: ['bad-bot']
    });

    const req = {
      headers: {
        'user-agent': 'good-bot/1.0'
      }
    };

    middleware(req, {}, done);
  });

  it('should handle missing user-agent header', (done) => {
    const middleware = darkforestblocker({
      blockedUserAgents: ['bad-bot']
    });

    const req = {
      headers: {}
    };

    middleware(req, {}, done);
  });
});