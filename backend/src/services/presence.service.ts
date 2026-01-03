/**
 * Presence Service
 *
 * Manages real-time editing state in Redis for collaborative features.
 * Tracks which users are editing which fields on tasks, enabling
 * presence indicators and conflict prevention.
 *
 * Key Pattern: presence:{projectId}:{taskId}:{field}:{socketId}
 *
 * Features:
 * - TTL-based automatic cleanup (30 seconds)
 * - Heartbeat refresh for long editing sessions
 * - Socket disconnect cleanup
 * - Project-wide presence queries
 */

import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';
import type { PresenceEntry, EditingField } from '../types/presence.js';

const presenceLogger = logger.child({ module: 'presence' });

class PresenceService {
  private readonly TTL = 30; // seconds
  private readonly PREFIX = 'presence';

  /**
   * Build a Redis key for presence tracking
   */
  private buildKey(
    projectId: string,
    taskId: string,
    field: EditingField,
    socketId: string
  ): string {
    return `${this.PREFIX}:${projectId}:${taskId}:${field}:${socketId}`;
  }

  /**
   * Set editing presence for a user on a specific task field
   */
  async setEditing(entry: PresenceEntry): Promise<void> {
    try {
      const key = this.buildKey(
        entry.projectId,
        entry.taskId,
        entry.field,
        entry.socketId
      );
      const value = JSON.stringify(entry);

      await redis.setex(key, this.TTL, value);

      presenceLogger.debug(
        {
          key,
          userId: entry.userId,
          taskId: entry.taskId,
          field: entry.field,
        },
        'Presence SET'
      );
    } catch (error) {
      presenceLogger.error(
        { err: error, entry },
        'Failed to set editing presence'
      );
      // Graceful degradation - don't throw
    }
  }

  /**
   * Clear editing presence when user stops editing
   */
  async clearEditing(
    projectId: string,
    taskId: string,
    field: EditingField,
    socketId: string
  ): Promise<void> {
    try {
      const key = this.buildKey(projectId, taskId, field, socketId);

      await redis.del(key);

      presenceLogger.debug(
        { key, taskId, field },
        'Presence CLEAR'
      );
    } catch (error) {
      presenceLogger.error(
        { err: error, projectId, taskId, field, socketId },
        'Failed to clear editing presence'
      );
      // Graceful degradation - don't throw
    }
  }

  /**
   * Refresh TTL for ongoing editing session (heartbeat/keepalive)
   */
  async refreshEditing(
    projectId: string,
    taskId: string,
    field: EditingField,
    socketId: string
  ): Promise<void> {
    try {
      const key = this.buildKey(projectId, taskId, field, socketId);

      await redis.expire(key, this.TTL);

      presenceLogger.debug(
        { key },
        'Presence REFRESH'
      );
    } catch (error) {
      presenceLogger.error(
        { err: error, projectId, taskId, field, socketId },
        'Failed to refresh editing presence'
      );
      // Graceful degradation - don't throw
    }
  }

  /**
   * Clear all presence entries for a disconnected socket
   * Returns the cleared entries for broadcasting cleanup to other clients
   */
  async clearAllForSocket(socketId: string): Promise<PresenceEntry[]> {
    const clearedEntries: PresenceEntry[] = [];

    try {
      const pattern = `${this.PREFIX}:*:*:*:${socketId}`;
      const keysToDelete: string[] = [];

      // Use SCAN to find all keys for this socket
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );
        cursor = nextCursor;
        keysToDelete.push(...keys);
      } while (cursor !== '0');

      // Get entry data before deleting (for broadcast)
      if (keysToDelete.length > 0) {
        for (const key of keysToDelete) {
          try {
            const value = await redis.get(key);
            if (value) {
              const entry = JSON.parse(value) as PresenceEntry;
              clearedEntries.push(entry);
            }
          } catch (parseError) {
            presenceLogger.warn(
              { err: parseError, key },
              'Failed to parse presence entry'
            );
          }
        }

        // Delete all keys
        await redis.del(...keysToDelete);

        presenceLogger.info(
          { socketId, count: keysToDelete.length },
          'Presence CLEAR ALL for socket'
        );
      }
    } catch (error) {
      presenceLogger.error(
        { err: error, socketId },
        'Failed to clear all presence for socket'
      );
      // Graceful degradation - return what we collected
    }

    return clearedEntries;
  }

  /**
   * Get all presence entries for a project
   * Used when a user joins a project to show current editors
   */
  async getProjectPresence(projectId: string): Promise<PresenceEntry[]> {
    const entries: PresenceEntry[] = [];

    try {
      const pattern = `${this.PREFIX}:${projectId}:*:*:*`;
      const keys: string[] = [];

      // Use SCAN to find all keys for this project
      let cursor = '0';
      do {
        const [nextCursor, foundKeys] = await redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );
        cursor = nextCursor;
        keys.push(...foundKeys);
      } while (cursor !== '0');

      // Get all entry values
      for (const key of keys) {
        try {
          const value = await redis.get(key);
          if (value) {
            const entry = JSON.parse(value) as PresenceEntry;
            entries.push(entry);
          }
        } catch (parseError) {
          presenceLogger.warn(
            { err: parseError, key },
            'Failed to parse presence entry'
          );
        }
      }

      presenceLogger.debug(
        { projectId, count: entries.length },
        'Presence GET project'
      );
    } catch (error) {
      presenceLogger.error(
        { err: error, projectId },
        'Failed to get project presence'
      );
      // Graceful degradation - return empty array
    }

    return entries;
  }
}

export const presenceService = new PresenceService();
