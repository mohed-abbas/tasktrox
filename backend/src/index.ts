import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './sockets/index.js';
import { prisma } from './config/database.js';
import { redis } from './config/redis.js';

const PORT = parseInt(process.env.PORT || '4000', 10);

const server = createServer(app);

// Initialize Socket.io
initializeSocket(server);

async function start() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Test Redis connection
    await redis.ping();
    console.log('✅ Redis connected');

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API available at http://localhost:${PORT}/api/v1`);
      console.log(`❤️ Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  await redis.quit();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

start();
