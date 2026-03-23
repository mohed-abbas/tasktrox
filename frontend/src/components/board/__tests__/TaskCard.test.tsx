import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { TaskCard } from '../TaskCard';
import type { Task } from '../Board';

// Mock lucide-react to avoid SVG rendering issues in happy-dom
vi.mock('lucide-react', () => ({
  Calendar: ({ className }: { className?: string }) => (
    <span data-testid="calendar-icon" className={className} />
  ),
  Paperclip: ({ className }: { className?: string }) => (
    <span data-testid="paperclip-icon" className={className} />
  ),
  Circle: ({ className }: { className?: string }) => (
    <span data-testid="circle-icon" className={className} />
  ),
  CheckCircle2: ({ className }: { className?: string }) => (
    <span data-testid="check-circle-icon" className={className} />
  ),
}));

// Mock PriorityBadge to render something testable
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
  getLabelStyles: (_color: string) => ({ bg: 'bg-test', text: 'text-test' }),
}));

function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Implement authentication',
    description: '<p>Add JWT-based auth flow</p>',
    order: 0,
    columnId: 'col-1',
    priority: null,
    dueDate: null,
    completedAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    labels: [],
    assignees: [],
    _count: { comments: 0, attachments: 0 },
    ...overrides,
  };
}

describe('TaskCard', () => {
  it('renders task title', () => {
    const task = createMockTask();
    renderWithProviders(<TaskCard task={task} />);
    expect(screen.getByText('Implement authentication')).toBeInTheDocument();
  });

  it('renders task description as stripped HTML', () => {
    const task = createMockTask({ description: '<p>Add JWT-based auth flow</p>' });
    renderWithProviders(<TaskCard task={task} />);
    expect(screen.getByText('Add JWT-based auth flow')).toBeInTheDocument();
  });

  it('renders label badges when labels are present', () => {
    const task = createMockTask({
      labels: [
        { id: 'lbl-1', name: 'Bug', color: '#EF4444' },
        { id: 'lbl-2', name: 'Frontend', color: '#3B82F6' },
      ],
    });
    renderWithProviders(<TaskCard task={task} />);
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('renders priority badge for HIGH priority', () => {
    const task = createMockTask({ priority: 'HIGH' });
    renderWithProviders(<TaskCard task={task} />);
    expect(screen.getByTestId('priority-badge')).toHaveTextContent('HIGH');
  });

  it('renders assignee avatars when assignees are present', () => {
    const task = createMockTask({
      assignees: [
        { id: 'user-1', name: 'Alice Smith', avatar: null },
        { id: 'user-2', name: 'Bob Jones', avatar: null },
      ],
      _count: { comments: 0, attachments: 1 },
    });
    renderWithProviders(<TaskCard task={task} />);
    // Assignee initials are displayed
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders due date when provided', () => {
    const task = createMockTask({ dueDate: '2026-06-15T00:00:00Z' });
    renderWithProviders(<TaskCard task={task} />);
    // formatDate returns long format: "June 15, 2026"
    expect(screen.getByText('June 15, 2026')).toBeInTheDocument();
  });

  it('calls onClick handler when card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const task = createMockTask();
    renderWithProviders(<TaskCard task={task} onClick={handleClick} />);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders attachment count when attachments exist', () => {
    const task = createMockTask({
      _count: { comments: 0, attachments: 3 },
      // Need assignees or attachments for footer to show
    });
    renderWithProviders(<TaskCard task={task} />);
    expect(screen.getByText('3 Files')).toBeInTheDocument();
  });

  it('renders singular "File" for single attachment', () => {
    const task = createMockTask({
      _count: { comments: 0, attachments: 1 },
    });
    renderWithProviders(<TaskCard task={task} />);
    expect(screen.getByText('1 File')).toBeInTheDocument();
  });

  it('does not render attachment count when zero', () => {
    const task = createMockTask({
      _count: { comments: 0, attachments: 0 },
    });
    renderWithProviders(<TaskCard task={task} />);
    expect(screen.queryByText(/Files?/)).not.toBeInTheDocument();
  });

  it('calls onToggleComplete when completion button is clicked', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    const task = createMockTask();
    renderWithProviders(
      <TaskCard task={task} onToggleComplete={handleToggle} />
    );

    const completeBtn = screen.getByRole('button', { name: 'Mark as complete' });
    await user.click(completeBtn);
    expect(handleToggle).toHaveBeenCalledWith('task-1', true);
  });

  it('shows completed state with strikethrough', () => {
    const task = createMockTask({ completedAt: '2026-03-01T00:00:00Z' });
    renderWithProviders(<TaskCard task={task} onToggleComplete={vi.fn()} />);
    // Title should have line-through class
    const title = screen.getByText('Implement authentication');
    expect(title).toHaveClass('line-through');
  });
});
