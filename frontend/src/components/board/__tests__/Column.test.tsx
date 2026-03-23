import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { Column } from '../Column';
import type { Task } from '../Board';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon" />,
  Paperclip: () => <span data-testid="paperclip-icon" />,
  Circle: () => <span data-testid="circle-icon" />,
  CheckCircle2: () => <span data-testid="check-circle-icon" />,
  ChevronRight: () => <span data-testid="chevron-icon" />,
  Plus: () => <span data-testid="plus-icon" />,
  X: () => <span data-testid="x-icon" />,
  MoreHorizontal: () => <span data-testid="more-icon" />,
  Pencil: () => <span data-testid="pencil-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
}));

// Mock PriorityBadge
vi.mock('@/components/task/PrioritySelector', () => ({
  PriorityBadge: ({ priority }: { priority: string }) => (
    <span data-testid="priority-badge">{priority}</span>
  ),
}));

// Mock editor utils
vi.mock('@/components/editor', () => ({
  stripHtml: (html: string | null) => html?.replace(/<[^>]*>/g, '') ?? '',
}));

// Mock label styles
vi.mock('@/components/labels', () => ({
  getLabelStyles: () => ({ bg: 'bg-test', text: 'text-test' }),
}));

// Mock presence hooks and components
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

function createMockTasks(): Task[] {
  return [
    {
      id: 'task-1',
      title: 'Write unit tests',
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
    {
      id: 'task-2',
      title: 'Fix navigation bug',
      description: null,
      order: 1,
      columnId: 'col-1',
      priority: 'HIGH',
      dueDate: null,
      completedAt: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      labels: [],
      assignees: [],
      _count: { comments: 0, attachments: 0 },
    },
    {
      id: 'task-3',
      title: 'Completed task',
      description: null,
      order: 2,
      columnId: 'col-1',
      priority: null,
      dueDate: null,
      completedAt: '2026-02-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z',
      labels: [],
      assignees: [],
      _count: { comments: 0, attachments: 0 },
    },
  ];
}

describe('Column', () => {
  it('renders column name in header', () => {
    renderWithProviders(
      <Column id="col-1" name="To Do" tasks={[]} />
    );
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('renders task cards for each incomplete task', () => {
    const tasks = createMockTasks();
    renderWithProviders(
      <Column id="col-1" name="To Do" tasks={tasks} />
    );
    expect(screen.getByText('Write unit tests')).toBeInTheDocument();
    expect(screen.getByText('Fix navigation bug')).toBeInTheDocument();
  });

  it('shows incomplete task count in header', () => {
    const tasks = createMockTasks();
    renderWithProviders(
      <Column id="col-1" name="To Do" tasks={tasks} />
    );
    // 2 incomplete tasks out of 3 total
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows explicit taskCount when provided', () => {
    renderWithProviders(
      <Column id="col-1" name="To Do" tasks={[]} taskCount={5} />
    );
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders show completed toggle when completed tasks exist', () => {
    const tasks = createMockTasks();
    renderWithProviders(
      <Column id="col-1" name="To Do" tasks={tasks} />
    );
    expect(screen.getByText('Show completed (1)')).toBeInTheDocument();
  });

  it('shows completed tasks when toggle is clicked', async () => {
    const user = userEvent.setup();
    const tasks = createMockTasks();
    renderWithProviders(
      <Column id="col-1" name="To Do" tasks={tasks} />
    );

    // Completed task should not be visible initially
    expect(screen.queryByText('Completed task')).not.toBeInTheDocument();

    // Click the toggle
    await user.click(screen.getByText('Show completed (1)'));

    // Now completed task should be visible
    expect(screen.getByText('Completed task')).toBeInTheDocument();
  });

  it('calls onTaskClick when a task card is clicked', async () => {
    const user = userEvent.setup();
    const handleTaskClick = vi.fn();
    const tasks = createMockTasks().filter((t) => !t.completedAt);
    renderWithProviders(
      <Column id="col-1" name="To Do" tasks={tasks} onTaskClick={handleTaskClick} />
    );

    // Click the first task card (which has role="button")
    const buttons = screen.getAllByRole('button');
    // Find the one that contains "Write unit tests"
    const taskButton = buttons.find((btn) => btn.textContent?.includes('Write unit tests'));
    expect(taskButton).toBeDefined();
    await user.click(taskButton!);
    expect(handleTaskClick).toHaveBeenCalledWith(tasks[0]);
  });
});
