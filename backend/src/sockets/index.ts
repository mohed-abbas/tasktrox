import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server;

export function initializeSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join project room
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`Socket ${socket.id} joined project:${projectId}`);
    });

    // Leave project room
    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      console.log(`Socket ${socket.id} left project:${projectId}`);
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
      console.log('Client disconnected:', socket.id);
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
