const assert = require('assert');
const sinon = require('sinon');
const redisClient = require('../utils/redisClient');
const BotController = require('../controllers/botController');

// FILE: controllers/botController.test.js

describe('BotController.blacklistToken Tests', () => {
  let req;
  let res;
  let setValueStub;

  beforeEach(() => {
    req = {
      body: {
        token: 'sampleToken',
      },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    setValueStub = sinon.stub(redisClient, 'setValue');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should blacklist token successfully', async () => {
    setValueStub.resolves(true);

    await BotController.blacklistToken(req, res);

    assert.ok(
      setValueStub.calledOnceWith(
        `blacklist_${req.body.token}`,
        'blacklisted',
        24 * 60 * 60 * 60
      )
    );
    assert.ok(res.status.calledOnceWith(200));
    assert.ok(
      res.json.calledOnceWith({ message: 'Token blacklisted successfully' })
    );
  });

  it('should return 400 if token is not provided', async () => {
    req.body.token = null;

    await BotController.blacklistToken(req, res);

    assert.ok(res.status.calledOnceWith(400));
    assert.ok(res.json.calledOnceWith({ error: 'Token is required' }));
  });

  it('should return 500 if failed to blacklist token', async () => {
    setValueStub.resolves(false);

    await BotController.blacklistToken(req, res);

    assert.ok(
      setValueStub.calledOnceWith(
        `blacklist_${req.body.token}`,
        'blacklisted',
        24 * 60 * 60 * 60
      )
    );
    assert.ok(res.status.calledOnceWith(500));
    assert.ok(res.json.calledOnceWith({ error: 'Failed to blacklist token' }));
  });

  it('should handle errors during token blacklisting', async () => {
    const error = new Error('Redis error');
    setValueStub.rejects(error);

    await BotController.blacklistToken(req, res);

    assert.ok(
      setValueStub.calledOnceWith(
        `blacklist_${req.body.token}`,
        'blacklisted',
        24 * 60 * 60 * 60
      )
    );
    assert.ok(res.status.calledOnceWith(500));
    assert.ok(
      res.json.calledOnceWith({ error: `Internal server error: ${error}` })
    );
  });
});
