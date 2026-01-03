// Custom React hooks

// Auth hook
export { useAuth, AuthProvider } from './useAuth';

// Board drag-and-drop hook
export { useBoardDnd } from './useBoardDnd';
export type {
  ActiveDragItem,
  BoardDndCallbacks,
  UseBoardDndOptions,
  UseBoardDndReturn,
} from './useBoardDnd';

// Column operations hook with optimistic updates
export { useColumns } from './useColumns';

// Task operations hook with optimistic updates
export { useTasks } from './useTasks';
export type { TaskWithColumn } from './useTasks';

// Single task operations hook
export { useTask } from './useTask';

// Label operations hook
export { useLabels } from './useLabels';

// Assignee operations hook
export { useAssignees } from './useAssignees';

// Project members hook
export { useProjectMembers, type MemberRole } from './useProjectMembers';

// View preference hook (per-project localStorage persistence)
export { useViewPreference, type ViewMode } from './useViewPreference';

// Search hook with debouncing
export { useSearch } from './useSearch';

// Filter state management hook
export { useFilters } from './useFilters';

// Projects operations hook
export { useProjects } from './useProjects';

// Auto-save hook with debouncing and status tracking
export { useAutoSave, type SaveStatus } from './useAutoSave';

// Presence tracking hook for real-time editing indicators
export { usePresence } from './usePresence';
export type {
  EditingUser,
  UsePresenceOptions,
  UsePresenceReturn,
} from './usePresence';
