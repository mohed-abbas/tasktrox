import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function joinProject(projectId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('project:join', projectId);
  }
}

export function leaveProject(projectId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('project:leave', projectId);
  }
}

export function emitEditingStart(projectId: string, taskId: string, userId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('editing:start', { projectId, taskId, userId });
  }
}

export function emitEditingStop(projectId: string, taskId: string, userId: string): void {
  const s = getSocket();
  if (s.connected) {
    s.emit('editing:stop', { projectId, taskId, userId });
  }
}
