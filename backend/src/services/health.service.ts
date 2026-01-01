/**
 * Health Check Service
 *
 * Provides health status information for:
 * - Liveness probes (is the process alive?)
 * - Readiness probes (can it accept traffic?)
 * - Full health status (detailed system information)
 */

import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  latencyMs?: number;
  error?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
  };
  system: {
    memory: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    nodeVersion: string;
  };
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check Redis connectivity
 */
async function checkRedis(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    await redis.ping();
    return {
      status: 'healthy',
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get full health status with all service checks
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const [database, redisHealth] = await Promise.all([checkDatabase(), checkRedis()]);

  const allHealthy = database.status === 'healthy' && redisHealth.status === 'healthy';
  const allUnhealthy = database.status === 'unhealthy' && redisHealth.status === 'unhealthy';

  const memoryUsage = process.memoryUsage();

  return {
    status: allHealthy ? 'healthy' : allUnhealthy ? 'unhealthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database,
      redis: redisHealth,
    },
    system: {
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      nodeVersion: process.version,
    },
  };
}

/**
 * Check if the service is ready to accept traffic
 * Returns true only if all critical services are healthy
 */
export async function isReady(): Promise<boolean> {
  try {
    const [dbHealth, redisHealth] = await Promise.all([checkDatabase(), checkRedis()]);
    return dbHealth.status === 'healthy' && redisHealth.status === 'healthy';
  } catch {
    return false;
  }
}

/**
 * Simple liveness check - just returns true if the process is running
 */
export function isAlive(): boolean {
  return true;
}
