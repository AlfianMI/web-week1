const Redis = require('ioredis');
const config = require('./env');

let redisClient = null;

function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      console.log(`[Redis] Connected successfully to Cache server (${config.redis.host}:${config.redis.port})`);
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Cache Client Error:', err.message);
    });
  }

  return redisClient;
}

/**
 * Test Redis Connectivity
 */
async function testRedisConnection() {
  try {
    const client = getRedisClient();
    if (client.status === 'wait') {
      await client.connect();
    }
    const pong = await client.ping();
    return { connected: pong === 'PONG' };
  } catch (error) {
    console.error('[Redis] Failed connection test:', error.message);
    return { connected: false, error: error.message };
  }
}

module.exports = {
  getRedisClient,
  testRedisConnection,
};
