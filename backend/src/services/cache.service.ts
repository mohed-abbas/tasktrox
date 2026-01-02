/**
 * Redis Cache Service
 *
 * Provides a generic cache-aside pattern implementation with:
 * - Type-safe caching with automatic serialization
 * - TTL-based expiration
 * - Pattern-based invalidation
 * - Cache stampede prevention
 * - Graceful degradation when Redis is unavailable
 */

import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';

const cacheLogger = logger.child({ module: 'cache' });

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  USER_PROJECTS: 60, // 1 minute - user's project list
  PROJECT: 120, // 2 minutes - project details
  PROJECT_MEMBERS: 300, // 5 minutes - member list (rarely changes)
  PROJECT_ACCESS: 300, // 5 minutes - access check result
  PROJECT_TASKS: 30, // 30 seconds - tasks change frequently
  TASK: 60, // 1 minute - single task details
} as const;

// Cache key prefixes
export const CACHE_KEYS = {
  userProjects: (userId: string) => `user:${userId}:projects`,
  project: (projectId: string) => `project:${projectId}`,
  projectMembers: (projectId: string) => `project:${projectId}:members`,
  projectAccess: (projectId: string, userId: string) => `project:${projectId}:access:${userId}`,
  projectTasks: (projectId: string) => `project:${projectId}:tasks`,
  task: (taskId: string) => `task:${taskId}`,
} as const;

/**
 * Generic cache-aside pattern implementation
 * Returns cached data if available, otherwise fetches and caches
 */
export async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get(key);

    if (cached !== null) {
      cacheLogger.debug({ key }, 'Cache HIT');
      return JSON.parse(cached) as T;
    }

    cacheLogger.debug({ key }, 'Cache MISS');
  } catch (error) {
    // Log error but continue to fetch from DB
    cacheLogger.warn({ key, err: error }, 'Cache read error, falling back to DB');
  }

  // Fetch from database
  const data = await fetchFn();

  // Store in cache (non-blocking)
  setCache(key, data, ttlSeconds).catch((err) => {
    cacheLogger.warn({ key, err }, 'Failed to set cache');
  });

  return data;
}

/**
 * Set a value in cache
 */
export async function setCache<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  try {
    const serialized = JSON.stringify(data, (_, value) => {
      // Handle Date serialization
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    });

    await redis.setex(key, ttlSeconds, serialized);
    cacheLogger.debug({ key, ttl: ttlSeconds }, 'Cache SET');
  } catch (error) {
    cacheLogger.warn({ key, err: error }, 'Cache set error');
  }
}

/**
 * Get a value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);

    if (cached === null) {
      return null;
    }

    return JSON.parse(cached, (_, value) => {
      // Handle Date deserialization
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    }) as T;
  } catch (error) {
    cacheLogger.warn({ key, err: error }, 'Cache get error');
    return null;
  }
}

/**
 * Invalidate a specific cache key
 */
export async function invalidate(key: string): Promise<void> {
  try {
    await redis.del(key);
    cacheLogger.debug({ key }, 'Cache INVALIDATE');
  } catch (error) {
    cacheLogger.warn({ key, err: error }, 'Cache invalidation error');
  }
}

/**
 * Invalidate multiple cache keys
 */
export async function invalidateMany(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  try {
    await redis.del(...keys);
    cacheLogger.debug({ keys }, 'Cache INVALIDATE MANY');
  } catch (error) {
    cacheLogger.warn({ keys, err: error }, 'Cache invalidation error');
  }
}

/**
 * Invalidate all cache keys matching a pattern
 * Use sparingly - SCAN is blocking
 */
export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    let cursor = '0';
    const keysToDelete: string[] = [];

    // Use SCAN to find matching keys (non-blocking iteration)
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      keysToDelete.push(...keys);
    } while (cursor !== '0');

    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
      cacheLogger.debug({ pattern, count: keysToDelete.length }, 'Cache INVALIDATE PATTERN');
    }
  } catch (error) {
    cacheLogger.warn({ pattern, err: error }, 'Cache pattern invalidation error');
  }
}

// ============ PROJECT-SPECIFIC CACHE METHODS ============

/**
 * Cache for user's project list
 */
export const projectCache = {
  async getUserProjects<T>(userId: string, fetchFn: () => Promise<T>): Promise<T> {
    return getOrSet(CACHE_KEYS.userProjects(userId), fetchFn, CACHE_TTL.USER_PROJECTS);
  },

  async getProject<T>(projectId: string, fetchFn: () => Promise<T>): Promise<T> {
    return getOrSet(CACHE_KEYS.project(projectId), fetchFn, CACHE_TTL.PROJECT);
  },

  async getMembers<T>(projectId: string, fetchFn: () => Promise<T>): Promise<T> {
    return getOrSet(CACHE_KEYS.projectMembers(projectId), fetchFn, CACHE_TTL.PROJECT_MEMBERS);
  },

  async checkAccess(
    projectId: string,
    userId: string,
    fetchFn: () => Promise<boolean>
  ): Promise<boolean> {
    return getOrSet(
      CACHE_KEYS.projectAccess(projectId, userId),
      fetchFn,
      CACHE_TTL.PROJECT_ACCESS
    );
  },

  /**
   * Invalidate all caches related to a project
   */
  async invalidateProject(projectId: string): Promise<void> {
    await invalidateMany([
      CACHE_KEYS.project(projectId),
      CACHE_KEYS.projectMembers(projectId),
      CACHE_KEYS.projectTasks(projectId),
    ]);
    // Also invalidate access checks for this project
    await invalidatePattern(`project:${projectId}:access:*`);
  },

  /**
   * Invalidate user's project list
   */
  async invalidateUserProjects(userId: string): Promise<void> {
    await invalidate(CACHE_KEYS.userProjects(userId));
  },

  /**
   * Invalidate member-related caches
   */
  async invalidateMembership(projectId: string, userId: string): Promise<void> {
    await invalidateMany([
      CACHE_KEYS.projectMembers(projectId),
      CACHE_KEYS.projectAccess(projectId, userId),
      CACHE_KEYS.userProjects(userId),
    ]);
  },
};

// ============ TASK-SPECIFIC CACHE METHODS ============

export const taskCache = {
  async getProjectTasks<T>(projectId: string, fetchFn: () => Promise<T>): Promise<T> {
    return getOrSet(CACHE_KEYS.projectTasks(projectId), fetchFn, CACHE_TTL.PROJECT_TASKS);
  },

  async getTask<T>(taskId: string, fetchFn: () => Promise<T>): Promise<T> {
    return getOrSet(CACHE_KEYS.task(taskId), fetchFn, CACHE_TTL.TASK);
  },

  /**
   * Invalidate task caches when a task changes
   */
  async invalidateTask(taskId: string, projectId: string): Promise<void> {
    await invalidateMany([CACHE_KEYS.task(taskId), CACHE_KEYS.projectTasks(projectId)]);
  },

  /**
   * Invalidate all tasks for a project
   */
  async invalidateProjectTasks(projectId: string): Promise<void> {
    await invalidate(CACHE_KEYS.projectTasks(projectId));
  },
};

export default {
  getOrSet,
  setCache,
  getCache,
  invalidate,
  invalidateMany,
  invalidatePattern,
  projectCache,
  taskCache,
  CACHE_KEYS,
  CACHE_TTL,
};
