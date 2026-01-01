import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './sockets/index.js';
import { prisma } from './config/database.js';
import { redis } from './config/redis.js';
import { env } from './config/env.js';
import { logger, dbLogger, redisLogger } from './config/logger.js';

const PORT = env.PORT;

const server = createServer(app);

// Initialize Socket.io
initializeSocket(server);

async function start() {
  try {
    // Test database connection
    await prisma.$connect();
    dbLogger.info('Database connected successfully');

    // Test Redis connection
    await redis.ping();
    redisLogger.info('Redis connected successfully');

    server.listen(PORT, () => {
      logger.info({ port: PORT }, 'Server started');
      logger.info({ url: `http://localhost:${PORT}/api/v1` }, 'API available');
      logger.info({ url: `http://localhost:${PORT}/health` }, 'Health check available');
    });
  } catch (error) {
    logger.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

start();
