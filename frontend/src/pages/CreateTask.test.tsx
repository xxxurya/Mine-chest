import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CreateTask from './CreateTask';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock the API
vi.mock('../api', () => ({
  fetchUsers: vi.fn(),
  createTask: vi.fn()
}));

import { fetchUsers, createTask } from '../api';

const mockUsers = [
  { id: 1, username: 'john', role: 'WORKER' },
  { id: 2, username: 'jane', role: 'MANAGER' }
];

describe('CreateTask Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchUsers as any).mockResolvedValue(mockUsers);
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('should render create task form', async () => {
    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assign to/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('should fetch users on mount', async () => {
    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledTimes(1);
    });
  });

  it('should show users in dropdown after loading', async () => {
    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      expect(screen.getByText('john (WORKER)')).toBeInTheDocument();
    });
    expect(screen.getByText('jane (MANAGER)')).toBeInTheDocument();
  });

  it('should disable submit button when form is invalid', async () => {
    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /create task/i });
      expect(submitButton).toBeDisabled();
    });
  });

  it('should enable submit button when title and assignee are filled', async () => {
    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      const assignSelect = screen.getByRole('combobox', { name: /assign to/i });
      
      userEvent.type(titleInput, 'Test Task');
      userEvent.selectOptions(assignSelect, '1');
      
      const submitButton = screen.getByRole('button', { name: /create task/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should call createTask API on submit', async () => {
    (createTask as any).mockResolvedValue({ id: 'task-1' });

    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      const assignSelect = screen.getByRole('combobox', { name: /assign to/i });
      const submitButton = screen.getByRole('button', { name: /create task/i });
      
      userEvent.type(titleInput, 'Test Task');
      userEvent.selectOptions(assignSelect, '1');
      userEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: '',
        assigned_to: 1
      });
    });
  });

  it('should show success message on successful task creation', async () => {
    (createTask as any).mockResolvedValue({ id: 'task-1' });

    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      const assignSelect = screen.getByRole('combobox', { name: /assign to/i });
      const submitButton = screen.getByRole('button', { name: /create task/i });
      
      userEvent.type(titleInput, 'Test Task');
      userEvent.selectOptions(assignSelect, '1');
      userEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/task created successfully/i)).toBeInTheDocument();
    });
  });

  it('should show error message on failed task creation', async () => {
    (createTask as any).mockRejectedValue(new Error('Failed to create task'));

    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      const assignSelect = screen.getByRole('combobox', { name: /assign to/i });
      const submitButton = screen.getByRole('button', { name: /create task/i });
      
      userEvent.type(titleInput, 'Test Task');
      userEvent.selectOptions(assignSelect, '1');
      userEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
    });
  });

  it('should reset form after successful creation', async () => {
    (createTask as any).mockResolvedValue({ id: 'task-1' });

    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      const assignSelect = screen.getByRole('combobox', { name: /assign to/i });
      const submitButton = screen.getByRole('button', { name: /create task/i });
      
      userEvent.type(titleInput, 'Test Task');
      userEvent.selectOptions(assignSelect, '1');
      userEvent.click(submitButton);
    });

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      expect(titleInput.value).toBe('');
    });
  });

  it('should show loading state while creating task', async () => {
    // Create a promise that we can resolve manually
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    (createTask as any).mockReturnValueOnce(promise);

    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/title/i);
      const assignSelect = screen.getByRole('combobox', { name: /assign to/i });
      const submitButton = screen.getByRole('button', { name: /create task/i });
      
      userEvent.type(titleInput, 'Test Task');
      userEvent.selectOptions(assignSelect, '1');
      userEvent.click(submitButton);
      
      expect(screen.getByText(/creating/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Resolve the promise
      resolvePromise!({ id: 'task-1' });
    });
  });

  it('should show error when fetching users fails', async () => {
    (fetchUsers as any).mockRejectedValue(new Error('Failed to load users'));

    renderWithRouter(<CreateTask />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    });
  });
});
