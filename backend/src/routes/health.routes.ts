/**
 * Health Check Routes
 *
 * Provides endpoints for:
 * - Kubernetes/container liveness probes
 * - Kubernetes/container readiness probes
 * - Detailed health status for monitoring
 */

import { Router, type Request, type Response } from 'express';
import * as healthService from '../services/health.service.js';

const router = Router();

/**
 * GET /health
 * Full health status with all service checks
 */
router.get('/', async (_req: Request, res: Response) => {
  const health = await healthService.getHealthStatus();

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
});

/**
 * GET /health/live
 * Liveness probe - is the process running?
 * Used by container orchestrators to determine if restart is needed
 */
router.get('/live', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/ready
 * Readiness probe - can the service accept traffic?
 * Returns 503 if critical services (DB, Redis) are unavailable
 */
router.get('/ready', async (_req: Request, res: Response) => {
  const ready = await healthService.isReady();

  if (ready) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'unavailable',
      timestamp: new Date().toISOString(),
      message: 'Service dependencies not ready',
    });
  }
});

export default router;
