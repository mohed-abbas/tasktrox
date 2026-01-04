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

// Cache keys
export const CACHE_KEYS = {
  USER_STATS: 'stats:user',
  PROJECT_STATS: 'stats:project',
  PRESENCE: 'presence',
} as const;

// Cache TTL in seconds
export const CACHE_TTL = {
  USER_STATS: 300, // 5 minutes
  PROJECT_STATS: 120, // 2 minutes
  PRESENCE: 30, // 30 seconds
} as const;
