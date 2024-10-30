const { createClient } = require('redis');

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  async connect() {
    await this.client.connect();
  }

  async setValue(key, value, expiry) {
    try {
      await this.client.set(key, value);
      if (expiry) {
        await this.client.expire(key, expiry);
      }
      return true;
    } catch (error) {
      console.error('Error setting value in Redis:', error);
      return false;
    }
  }

  async getValue(key) {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error('Error getting value from Redis:', error);
      return null;
    }
  }
}

const redisClient = new RedisClient();
redisClient.connect();

module.exports = redisClient;
