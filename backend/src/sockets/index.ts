import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { socketLogger } from '../config/logger.js';

let io: Server;

export function initializeSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socketLogger.debug({ socketId: socket.id }, 'Client connected');

    // Join project room
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
      socketLogger.debug({ socketId: socket.id, projectId }, 'Socket joined project room');
    });

    // Leave project room
    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      socketLogger.debug({ socketId: socket.id, projectId }, 'Socket left project room');
    });

    // Handle editing events
    socket.on('editing:start', (data: { projectId: string; taskId: string; userId: string }) => {
      socket.to(`project:${data.projectId}`).emit('editing:started', {
        taskId: data.taskId,
        userId: data.userId,
      });
    });

    socket.on('editing:stop', (data: { projectId: string; taskId: string; userId: string }) => {
      socket.to(`project:${data.projectId}`).emit('editing:stopped', {
        taskId: data.taskId,
        userId: data.userId,
      });
    });

    socket.on('disconnect', () => {
      socketLogger.debug({ socketId: socket.id }, 'Client disconnected');
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
