const assert = require('assert');
const sinon = require('sinon');
const { createClient } = require('redis');
const RedisClient = require('../utils/redisClient');

// FILE: utils/redisClient.test.js

describe('RedisClient Tests', () => {
  let redisClient;
  let createClientStub;
  let clientMock;

  before(() => {
    clientMock = {
      on: sinon.stub(),
      connect: sinon.stub(),
      set: sinon.stub(),
      expire: sinon.stub(),
      get: sinon.stub(),
    };
    createClientStub = sinon.stub(createClient).returns(clientMock);
    redisClient = new RedisClient();
  });

  after(() => {
    sinon.restore();
  });

  it('should initialize Redis client correctly', () => {
    assert.ok(createClientStub.calledOnce);
    assert.ok(clientMock.on.calledWith('error', sinon.match.func));
  });

  it('should connect to Redis successfully', async () => {
    clientMock.connect.resolves();
    await redisClient.connect();
    assert.ok(clientMock.connect.calledOnce);
  });

  it('should handle errors during Redis connection', async () => {
    const error = new Error('Connection error');
    clientMock.connect.rejects(error);
    try {
      await redisClient.connect();
    } catch (err) {
      assert.strictEqual(err, error);
    }
  });

  it('should set value in Redis successfully', async () => {
    clientMock.set.resolves('OK');
    clientMock.expire.resolves(true);

    const result = await redisClient.setValue('key', 'value', 60);
    assert.strictEqual(result, true);
    assert.ok(clientMock.set.calledOnceWith('key', 'value'));
    assert.ok(clientMock.expire.calledOnceWith('key', 60));
  });

  it('should set value in Redis without expiry', async () => {
    clientMock.set.resolves('OK');

    const result = await redisClient.setValue('key', 'value');
    assert.strictEqual(result, true);
    assert.ok(clientMock.set.calledOnceWith('key', 'value'));
    assert.ok(clientMock.expire.notCalled);
  });

  it('should handle errors during setting value in Redis', async () => {
    const error = new Error('Set error');
    clientMock.set.rejects(error);

    const result = await redisClient.setValue('key', 'value');
    assert.strictEqual(result, false);
    assert.ok(clientMock.set.calledOnceWith('key', 'value'));
  });

  it('should get value from Redis successfully', async () => {
    clientMock.get.resolves('value');

    const result = await redisClient.getValue('key');
    assert.strictEqual(result, 'value');
    assert.ok(clientMock.get.calledOnceWith('key'));
  });

  it('should handle errors during getting value from Redis', async () => {
    const error = new Error('Get error');
    clientMock.get.rejects(error);

    const result = await redisClient.getValue('key');
    assert.strictEqual(result, null);
    assert.ok(clientMock.get.calledOnceWith('key'));
  });
});
