import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock fetch globally
global.fetch = vi.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render registration form', () => {
    renderWithRouter(<Register />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should show error for empty username', async () => {
    renderWithRouter(<Register />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });
  });

  it('should show error for empty password', async () => {
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    await userEvent.type(usernameInput, 'testuser');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should show error if role is not selected', async () => {
    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please select a role/i)).toBeInTheDocument();
    });
  });

  it('should call register API on submit with valid data', async () => {
    const mockResponse = { message: 'User created successfully', userId: 1 };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(roleSelect);
    await userEvent.click(screen.getByRole('option', { name: /worker/i }));
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: 'testuser', 
            password: 'password123',
            role: 'WORKER'
          })
        })
      );
    });
  });

  it('should show success message on successful registration', async () => {
    const mockResponse = { message: 'User created successfully', userId: 1 };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(roleSelect);
    await userEvent.click(screen.getByRole('option', { name: /worker/i }));
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it('should show error message on failed registration', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Username already exists' })
    });

    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await userEvent.type(usernameInput, 'existinguser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(roleSelect);
    await userEvent.click(screen.getByRole('option', { name: /worker/i }));
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
    });
  });

  it('should show loading state while registering', async () => {
    // Create a promise that we can resolve manually
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    (global.fetch as any).mockReturnValueOnce(promise);

    renderWithRouter(<Register />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(roleSelect);
    await userEvent.click(screen.getByRole('option', { name: /worker/i }));
    await userEvent.click(submitButton);
    
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Resolve the promise
    resolvePromise!({ ok: true, json: async () => ({ message: 'User created', userId: 1 }) });
  });
});
