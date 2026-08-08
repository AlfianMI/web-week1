const app = require('./app');
const config = require('./config/env');
const { testDbConnection, initDbSchema, pool } = require('./config/database');
const { getRedisClient, testRedisConnection } = require('./config/redis');

let server;

async function startServer() {
  console.log('--- Starting Startup Multi-Service API ---');
  
  // Test dependencies connections asynchronously
  const [dbRes, redisRes] = await Promise.all([
    testDbConnection(),
    testRedisConnection(),
  ]);

  if (dbRes.connected) {
    await initDbSchema();
  } else {
    console.warn('[Startup] Warning: Database connection failed. API will run, but DB requests will error until database is available.');
  }

  if (!redisRes.connected) {
    console.warn('[Startup] Warning: Redis Cache connection failed. API will fallback directly to Database queries.');
  }

  server = app.listen(config.port, () => {
    console.log(`[Server] Running in ${config.env} mode on http://localhost:${config.port}`);
    console.log(`[Server] Health Check available at http://localhost:${config.port}/health/deep`);
  });
}

// Graceful Shutdown Handler
async function gracefulShutdown(signal) {
  console.log(`\n[Shutdown] Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log('[Server] Closed remaining active HTTP connections.');
    });
  }

  try {
    await pool.end();
    console.log('[DB] PostgreSQL pool closed.');
  } catch (err) {
    console.error('[DB Error] Error closing PostgreSQL pool:', err.message);
  }

  try {
    const redis = getRedisClient();
    await redis.quit();
    console.log('[Redis] Redis connection closed.');
  } catch (err) {
    console.error('[Redis Error] Error closing Redis client:', err.message);
  }

  console.log('[Shutdown] Cleanup finished. Exiting process.');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
