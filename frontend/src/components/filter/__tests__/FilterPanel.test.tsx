import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import { FilterPanel, emptyFilters, type FilterState } from '../FilterPanel';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="x-icon" />,
  Calendar: () => <span data-testid="calendar-icon" />,
  Flag: () => <span data-testid="flag-icon" />,
  Tag: () => <span data-testid="tag-icon" />,
  Users: () => <span data-testid="users-icon" />,
  ChevronDown: () => <span data-testid="chevron-icon" />,
  Check: () => <span data-testid="check-icon" />,
}));

// Mock framer-motion to avoid animation issues
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockLabels = [
  { id: 'lbl-1', name: 'Bug', color: '#EF4444', projectId: 'proj-1', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'lbl-2', name: 'Feature', color: '#3B82F6', projectId: 'proj-1', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
];

const mockMembers = [
  { id: 'user-1', name: 'Alice Smith', avatar: null },
  { id: 'user-2', name: 'Bob Jones', avatar: null },
];

describe('FilterPanel', () => {
  it('renders Priority filter button', () => {
    renderWithProviders(
      <FilterPanel filters={emptyFilters} onFiltersChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /Priority/i })).toBeInTheDocument();
  });

  it('renders Due Date filter button', () => {
    renderWithProviders(
      <FilterPanel filters={emptyFilters} onFiltersChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /Due Date/i })).toBeInTheDocument();
  });

  it('renders Labels filter button when labels are provided', () => {
    renderWithProviders(
      <FilterPanel
        filters={emptyFilters}
        onFiltersChange={vi.fn()}
        labels={mockLabels}
      />
    );
    expect(screen.getByRole('button', { name: /Labels/i })).toBeInTheDocument();
  });

  it('does not render Labels filter when no labels provided', () => {
    renderWithProviders(
      <FilterPanel filters={emptyFilters} onFiltersChange={vi.fn()} />
    );
    expect(screen.queryByRole('button', { name: /Labels/i })).not.toBeInTheDocument();
  });

  it('renders Assignees filter button when members are provided', () => {
    renderWithProviders(
      <FilterPanel
        filters={emptyFilters}
        onFiltersChange={vi.fn()}
        members={mockMembers}
      />
    );
    expect(screen.getByRole('button', { name: /Assignees/i })).toBeInTheDocument();
  });

  it('shows priority options when Priority button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <FilterPanel filters={emptyFilters} onFiltersChange={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: /Priority/i }));
    // Priority options should appear in popover
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('calls onFiltersChange when a priority option is toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderWithProviders(
      <FilterPanel filters={emptyFilters} onFiltersChange={handleChange} />
    );

    await user.click(screen.getByRole('button', { name: /Priority/i }));
    await user.click(screen.getByText('High'));

    expect(handleChange).toHaveBeenCalledWith({
      ...emptyFilters,
      priority: ['HIGH'],
    });
  });

  it('shows due date options when Due Date button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <FilterPanel filters={emptyFilters} onFiltersChange={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: /Due Date/i }));
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Due today')).toBeInTheDocument();
    expect(screen.getByText('Due this week')).toBeInTheDocument();
    expect(screen.getByText('No due date')).toBeInTheDocument();
  });

  it('calls onFiltersChange when a due date option is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderWithProviders(
      <FilterPanel filters={emptyFilters} onFiltersChange={handleChange} />
    );

    await user.click(screen.getByRole('button', { name: /Due Date/i }));
    await user.click(screen.getByText('Overdue'));

    expect(handleChange).toHaveBeenCalledWith({
      ...emptyFilters,
      dueDate: 'overdue',
    });
  });

  it('shows Clear filters button when filters are active', () => {
    const activeFilters: FilterState = {
      ...emptyFilters,
      priority: ['HIGH'],
    };
    renderWithProviders(
      <FilterPanel filters={activeFilters} onFiltersChange={vi.fn()} />
    );
    expect(screen.getByRole('button', { name: /Clear filters/i })).toBeInTheDocument();
  });

  it('calls onFiltersChange with empty filters when Clear is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const activeFilters: FilterState = {
      ...emptyFilters,
      priority: ['HIGH'],
    };
    renderWithProviders(
      <FilterPanel filters={activeFilters} onFiltersChange={handleChange} />
    );

    await user.click(screen.getByRole('button', { name: /Clear filters/i }));
    expect(handleChange).toHaveBeenCalledWith(emptyFilters);
  });

  it('does not show Clear filters button when no filters are active', () => {
    renderWithProviders(
      <FilterPanel filters={emptyFilters} onFiltersChange={vi.fn()} />
    );
    expect(screen.queryByRole('button', { name: /Clear filters/i })).not.toBeInTheDocument();
  });
});
