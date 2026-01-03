import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { socketLogger } from '../config/logger.js';
import { socketAuthMiddleware } from './socketAuth.middleware.js';
import { presenceService } from '../services/presence.service.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  TypedServer,
  TypedSocket,
} from '../types/presence.js';

let io: TypedServer;

export function initializeSocket(server: HttpServer): TypedServer {
  io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    server,
    {
      path: '/socket.io',
      cors: {
        origin: env.CORS_ORIGIN,
        credentials: true,
      },
    }
  );

  socketLogger.info({ corsOrigin: env.CORS_ORIGIN }, 'Socket.io server configured');

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket: TypedSocket) => {
    const user = socket.data.user!;
    socketLogger.info(
      { socketId: socket.id, userId: user.id, userName: user.name },
      'Authenticated client connected'
    );

    // Join project room
    socket.on('project:join', async (projectId: string) => {
      socket.join(`project:${projectId}`);
      socketLogger.debug(
        { socketId: socket.id, projectId, userId: user.id },
        'Socket joined project room'
      );

      // Send current presence state for this project
      const entries = await presenceService.getProjectPresence(projectId);
      if (entries.length > 0) {
        socket.emit('presence:sync', entries);
      }
    });

    // Leave project room
    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      socketLogger.debug(
        { socketId: socket.id, projectId, userId: user.id },
        'Socket left project room'
      );
    });

    // Handle editing start - store in Redis and broadcast
    socket.on('editing:start', async (payload) => {
      const { projectId, taskId, field } = payload;

      // Store presence in Redis with TTL
      await presenceService.setEditing({
        taskId,
        field,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        projectId,
        socketId: socket.id,
        startedAt: Date.now(),
      });

      // Broadcast to other users in the project room
      socket.to(`project:${projectId}`).emit('editing:active', {
        taskId,
        field,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
      });

      socketLogger.debug(
        { socketId: socket.id, userId: user.id, projectId, taskId, field },
        'User started editing'
      );
    });

    // Handle editing stop - clear from Redis and broadcast
    socket.on('editing:stop', async (payload) => {
      const { projectId, taskId, field } = payload;

      // Clear presence from Redis
      await presenceService.clearEditing(projectId, taskId, field, socket.id);

      // Broadcast to other users in the project room
      socket.to(`project:${projectId}`).emit('editing:inactive', {
        taskId,
        field,
      });

      socketLogger.debug(
        { socketId: socket.id, userId: user.id, projectId, taskId, field },
        'User stopped editing'
      );
    });

    // Handle disconnect - cleanup all presence entries for this socket
    socket.on('disconnect', async () => {
      socketLogger.info(
        { socketId: socket.id, userId: user.id },
        'Client disconnected, cleaning up presence'
      );

      // Clear all presence entries for this socket and get the entries
      const clearedEntries = await presenceService.clearAllForSocket(socket.id);

      // Broadcast editing:inactive for each cleared entry
      for (const entry of clearedEntries) {
        io.to(`project:${entry.projectId}`).emit('editing:inactive', {
          taskId: entry.taskId,
          field: entry.field,
        });

        socketLogger.debug(
          { projectId: entry.projectId, taskId: entry.taskId, field: entry.field },
          'Cleared presence entry on disconnect'
        );
      }
    });
  });

  socketLogger.info('Socket.io server initialized with authentication');
  return io;
}

export function getIO(): TypedServer {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
