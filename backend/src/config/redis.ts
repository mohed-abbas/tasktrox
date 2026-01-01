import Redis from 'ioredis';
import { env } from './env.js';
import { redisLogger } from './logger.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      redisLogger.error('Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => {
  redisLogger.info('Redis client connected');
});

redis.on('error', (err) => {
  redisLogger.error({ err }, 'Redis connection error');
});
