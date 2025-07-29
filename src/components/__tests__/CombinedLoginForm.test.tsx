import { render, screen, fireEvent, waitFor } from '@/../src/__tests__/test-utils';
import CombinedLoginForm from '../CombinedLoginForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock do next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(() => Promise.resolve({ ok: true })),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

const onOpenSignUp = vi.fn();

describe('CombinedLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o formulário de login', () => {
    render(<CombinedLoginForm onOpenSignUp={onOpenSignUp} error={undefined} />);
    expect(screen.getByLabelText(/Email ou CPF/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('exibe erro se o campo estiver vazio e tentar submeter', async () => {
    render(<CombinedLoginForm onOpenSignUp={onOpenSignUp} error={undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));
    expect(await screen.findByText(/Formato inválido/i)).toBeInTheDocument();
  });

  it('exibe erro vindo da prop error', () => {
    render(<CombinedLoginForm onOpenSignUp={onOpenSignUp} error={'Erro de autenticação'} />);
    expect(screen.getByText(/Erro de autenticação/i)).toBeInTheDocument();
  });

  it('chama signIn ao submeter com email válido', async () => {
    const { signIn } = await import('next-auth/react');
    render(<CombinedLoginForm onOpenSignUp={onOpenSignUp} error={undefined} />);
    fireEvent.change(screen.getByLabelText(/Email ou CPF/i), { target: { value: 'teste@teste.com' } });
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', expect.objectContaining({ email: 'teste@teste.com', password: '123456', redirect: false }));
    });
  });
}); 