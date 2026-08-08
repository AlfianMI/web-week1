const { testDbConnection } = require('../config/database');
const { testRedisConnection } = require('../config/redis');

class HealthController {
  static getBasicHealth(req, res) {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'startup-multi-service-api',
    });
  }

  static async getDeepHealth(req, res) {
    const [dbStatus, redisStatus] = await Promise.all([
      testDbConnection(),
      testRedisConnection(),
    ]);

    const isHealthy = dbStatus.connected && redisStatus.connected;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
      timestamp: new Date().toISOString(),
      components: {
        database: {
          type: 'PostgreSQL',
          connected: dbStatus.connected,
          details: dbStatus.connected ? { time: dbStatus.time } : { error: dbStatus.error },
        },
        cache: {
          type: 'Redis',
          connected: redisStatus.connected,
          details: redisStatus.connected ? { status: 'PONG' } : { error: redisStatus.error },
        },
      },
    });
  }
}

module.exports = HealthController;
