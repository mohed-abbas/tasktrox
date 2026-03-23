import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { Board } from '../Board';
import type { ColumnWithTasks } from '../Board';

// Mock DnD-kit to avoid complex DnD environment setup
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  useDroppable: vi.fn(() => ({ setNodeRef: vi.fn(), isOver: false })),
  closestCorners: vi.fn(),
  pointerWithin: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  horizontalListSortingStrategy: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  arrayMove: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: vi.fn(() => '') } },
}));

// Mock useBoardDnd hook
vi.mock('@/hooks/useBoardDnd', () => ({
  useBoardDnd: ({ columns }: { columns: ColumnWithTasks[] }) => ({
    sensors: [],
    collisionDetection: vi.fn(),
    activeItem: null,
    sortedColumns: columns,
    columnIds: columns.map((c: ColumnWithTasks) => c.id),
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
  }),
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon" />,
  MoreHorizontal: () => <span data-testid="more-icon" />,
  Pencil: () => <span data-testid="pencil-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
  Calendar: () => <span data-testid="calendar-icon" />,
  Paperclip: () => <span data-testid="paperclip-icon" />,
  Circle: () => <span data-testid="circle-icon" />,
  CheckCircle2: () => <span data-testid="check-circle-icon" />,
  ChevronRight: () => <span data-testid="chevron-icon" />,
  X: () => <span data-testid="x-icon" />,
}));

// Mock sub-components that have complex deps
vi.mock('@/components/task/PrioritySelector', () => ({
  PriorityBadge: ({ priority }: { priority: string }) => (
    <span data-testid="priority-badge">{priority}</span>
  ),
}));

vi.mock('@/components/editor', () => ({
  stripHtml: (html: string | null) => html?.replace(/<[^>]*>/g, '') ?? '',
}));

vi.mock('@/components/labels', () => ({
  getLabelStyles: () => ({ bg: 'bg-test', text: 'text-test' }),
}));

vi.mock('@/hooks/usePresence', () => ({
  usePresence: () => ({
    editingUser: null,
    startEditing: vi.fn(),
    stopEditing: vi.fn(),
  }),
}));

vi.mock('@/components/presence/PresenceIndicator', () => ({
  PresenceIndicator: () => null,
}));

function createMockColumns(): ColumnWithTasks[] {
  return [
    {
      id: 'col-1',
      name: 'To Do',
      order: 0,
      projectId: 'proj-1',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      tasks: [
        {
          id: 'task-1',
          title: 'Design mockups',
          description: null,
          order: 0,
          columnId: 'col-1',
          priority: null,
          dueDate: null,
          completedAt: null,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          labels: [],
          assignees: [],
          _count: { comments: 0, attachments: 0 },
        },
      ],
    },
    {
      id: 'col-2',
      name: 'In Progress',
      order: 1,
      projectId: 'proj-1',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      tasks: [
        {
          id: 'task-2',
          title: 'Build API endpoints',
          description: null,
          order: 0,
          columnId: 'col-2',
          priority: 'HIGH',
          dueDate: null,
          completedAt: null,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
          labels: [],
          assignees: [],
          _count: { comments: 0, attachments: 0 },
        },
      ],
    },
  ];
}

describe('Board', () => {
  it('renders column headers', () => {
    const columns = createMockColumns();
    renderWithProviders(
      <Board columns={columns} projectId="proj-1" />
    );
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders task titles within columns', () => {
    const columns = createMockColumns();
    renderWithProviders(
      <Board columns={columns} projectId="proj-1" />
    );
    expect(screen.getByText('Design mockups')).toBeInTheDocument();
    expect(screen.getByText('Build API endpoints')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    renderWithProviders(
      <Board columns={[]} projectId="proj-1" isLoading />
    );
    // Loading state renders skeleton with animate-pulse
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
    // Should NOT render column headers
    expect(screen.queryByText('To Do')).not.toBeInTheDocument();
  });

  it('shows empty state when columns array is empty', () => {
    renderWithProviders(
      <Board columns={[]} projectId="proj-1" />
    );
    expect(screen.getByText('No columns yet')).toBeInTheDocument();
    expect(
      screen.getByText('Start by adding your first column to organize your tasks.')
    ).toBeInTheDocument();
  });

  it('shows read-only empty state message for viewer role', () => {
    renderWithProviders(
      <Board columns={[]} projectId="proj-1" readOnly />
    );
    expect(screen.getByText('No columns yet')).toBeInTheDocument();
    expect(screen.getByText('This project has no columns.')).toBeInTheDocument();
  });
});
