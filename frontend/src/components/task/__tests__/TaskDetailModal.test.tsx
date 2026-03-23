import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { TaskDetailModal } from '../TaskDetailModal';
import type { Task } from '@/lib/api/tasks';

// Mock lucide-react - include all icons that may be imported by sub-components
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon" />,
  MoreHorizontal: () => <span data-testid="more-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
  Loader2: ({ className }: { className?: string }) => (
    <span data-testid="loader-icon" className={className} />
  ),
  Circle: () => <span data-testid="circle-icon" />,
  CheckCircle2: () => <span data-testid="check-circle-icon" />,
  Flag: () => <span data-testid="flag-icon" />,
  ChevronDown: () => <span data-testid="chevron-down-icon" />,
  Check: () => <span data-testid="check-icon" />,
  Calendar: () => <span data-testid="calendar-icon" />,
  Plus: () => <span data-testid="plus-icon" />,
  Paperclip: () => <span data-testid="paperclip-icon" />,
  Upload: () => <span data-testid="upload-icon" />,
  File: () => <span data-testid="file-icon" />,
  Image: () => <span data-testid="image-icon" />,
  Download: () => <span data-testid="download-icon" />,
  MessageSquare: () => <span data-testid="message-icon" />,
  Send: () => <span data-testid="send-icon" />,
  Tag: () => <span data-testid="tag-icon" />,
  Users: () => <span data-testid="users-icon" />,
  UserPlus: () => <span data-testid="user-plus-icon" />,
  Pencil: () => <span data-testid="pencil-icon" />,
  Bold: () => <span data-testid="bold-icon" />,
  Italic: () => <span data-testid="italic-icon" />,
  Underline: () => <span data-testid="underline-icon" />,
  List: () => <span data-testid="list-icon" />,
  ListOrdered: () => <span data-testid="list-ordered-icon" />,
  Link: () => <span data-testid="link-icon" />,
  ListTodo: () => <span data-testid="list-todo-icon" />,
  Strikethrough: () => <span data-testid="strikethrough-icon" />,
  Undo2: () => <span data-testid="undo-icon" />,
  Redo2: () => <span data-testid="redo-icon" />,
  ChevronRight: () => <span data-testid="chevron-right-icon" />,
  AlertCircle: () => <span data-testid="alert-circle-icon" />,
  Smile: () => <span data-testid="smile-icon" />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      onClick,
      role,
      ..._rest
    }: React.HTMLAttributes<HTMLDivElement> & { variants?: unknown; initial?: string; animate?: string; exit?: string }) => (
      <div className={className} onClick={onClick} role={role}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock hooks
vi.mock('@/hooks/useAssignees', () => ({
  useAssignees: () => ({
    assignees: [],
    members: [],
    addAssignee: vi.fn(),
    removeAssignee: vi.fn(),
    isLoading: false,
    isMembersLoading: false,
    isMutating: false,
  }),
}));

vi.mock('@/hooks/useAttachments', () => ({
  useAttachments: () => ({
    attachments: [],
    isLoading: false,
    uploadAsync: vi.fn(),
    isUploading: false,
    uploadError: null,
    deleteAttachment: vi.fn(),
    deletingId: null,
  }),
}));

vi.mock('@/hooks/usePresence', () => ({
  usePresence: () => ({
    editingUser: null,
    startEditing: vi.fn(),
    stopEditing: vi.fn(),
  }),
}));

// Mock sub-components
vi.mock('@/components/presence/PresenceIndicator', () => ({
  PresenceIndicator: () => null,
}));

vi.mock('@/components/comment', () => ({
  CommentSection: () => <div data-testid="comment-section">Comments</div>,
}));

vi.mock('@/components/attachment', () => ({
  AttachmentUploader: () => <div data-testid="attachment-uploader">Uploader</div>,
  AttachmentList: () => <div data-testid="attachment-list">Attachments</div>,
}));

vi.mock('@/components/editor', () => ({
  RichTextEditor: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string | null;
    onChange: (val: string) => void;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: () => void;
  }) => (
    <textarea
      data-testid="rich-text-editor"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@/components/task/DatePicker', () => ({
  DatePicker: ({ value, disabled: _disabled }: { value: Date | null; onChange: (d: Date | null) => void; disabled?: boolean }) => (
    <div data-testid="date-picker">{value ? value.toISOString() : 'No date'}</div>
  ),
}));

vi.mock('@/components/task/PrioritySelector', () => ({
  PrioritySelector: ({
    value,
    onChange: _onChange,
    disabled: _disabled,
  }: {
    value: string | null;
    onChange: (v: string) => void;
    showLabel?: boolean;
    className?: string;
    disabled?: boolean;
  }) => (
    <div data-testid="priority-selector">{value ?? 'No priority'}</div>
  ),
}));

vi.mock('@/components/task/AssigneeSelector', () => ({
  AssigneeSelector: () => <div data-testid="assignee-selector">Assignee Selector</div>,
  AssigneeAvatarStack: () => <div data-testid="assignee-stack">Assignees</div>,
}));

vi.mock('@/components/labels', () => ({
  LabelSelector: () => <div data-testid="label-selector">Label Selector</div>,
  LabelBadge: ({ label }: { label: { name: string } }) => (
    <span data-testid="label-badge">{label.name}</span>
  ),
  getLabelStyles: () => ({ bg: 'bg-test', text: 'text-test' }),
}));

// Mock Radix UI components
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div role="alertdialog">{children}</div> : null
  ),
  AlertDialogAction: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant: _variant,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

function createMockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Implement authentication',
    description: '<p>Add JWT-based auth flow</p>',
    order: 0,
    columnId: 'col-1',
    projectId: 'proj-1',
    priority: 'HIGH',
    dueDate: '2026-06-15T00:00:00Z',
    completedAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    labels: [
      { id: 'lbl-1', name: 'Bug', color: '#EF4444' },
    ],
    assignees: [
      { id: 'user-1', name: 'Alice', avatar: null },
    ],
    _count: { comments: 2, attachments: 1 },
    ...overrides,
  };
}

describe('TaskDetailModal', () => {
  it('renders task title when open', () => {
    const task = createMockTask();
    renderWithProviders(
      <TaskDetailModal
        task={task}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    const titleInput = screen.getByDisplayValue('Implement authentication');
    expect(titleInput).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    const task = createMockTask();
    renderWithProviders(
      <TaskDetailModal
        task={task}
        open={false}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.queryByDisplayValue('Implement authentication')).not.toBeInTheDocument();
  });

  it('renders priority selector with current priority', () => {
    const task = createMockTask({ priority: 'HIGH' });
    renderWithProviders(
      <TaskDetailModal
        task={task}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('priority-selector')).toHaveTextContent('HIGH');
  });

  it('shows close button', () => {
    const task = createMockTask();
    renderWithProviders(
      <TaskDetailModal
        task={task}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked (no changes)', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    const task = createMockTask();
    renderWithProviders(
      <TaskDetailModal
        task={task}
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders label badges for task labels', () => {
    const task = createMockTask({
      labels: [
        { id: 'lbl-1', name: 'Bug', color: '#EF4444' },
        { id: 'lbl-2', name: 'Frontend', color: '#3B82F6' },
      ],
    });
    renderWithProviders(
      <TaskDetailModal
        task={task}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    renderWithProviders(
      <TaskDetailModal
        task={null}
        open={true}
        onOpenChange={vi.fn()}
        isLoading={true}
      />
    );
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('shows "Task not found" when open with null task and not loading', () => {
    renderWithProviders(
      <TaskDetailModal
        task={null}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByText('Task not found')).toBeInTheDocument();
  });

  it('renders Save and Cancel buttons when onUpdate is provided', () => {
    const task = createMockTask();
    renderWithProviders(
      <TaskDetailModal
        task={task}
        open={true}
        onOpenChange={vi.fn()}
        onUpdate={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders created and updated dates', () => {
    const task = createMockTask({
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-03-20T00:00:00Z',
    });
    renderWithProviders(
      <TaskDetailModal
        task={task}
        open={true}
        onOpenChange={vi.fn()}
      />
    );
    expect(screen.getByText(/Created/)).toBeInTheDocument();
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  it('renders in read-only mode without edit controls', () => {
    const task = createMockTask();
    renderWithProviders(
      <TaskDetailModal
        task={task}
        open={true}
        onOpenChange={vi.fn()}
        onUpdate={vi.fn()}
        readOnly={true}
      />
    );
    // Save/Cancel buttons should not appear in read-only mode
    expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });
});
