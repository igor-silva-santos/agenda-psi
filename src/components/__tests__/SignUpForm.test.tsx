import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUpForm from '../SignUpForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock do next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(() => Promise.resolve({ ok: true })),
}));

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza o formulário de cadastro', () => {
    render(<SignUpForm onClose={vi.fn()} />);
    expect(screen.getByText(/Criar Conta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar senha/i)).toBeInTheDocument();
  });

  it('valida campos obrigatórios', async () => {
    render(<SignUpForm onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));
    expect(await screen.findByText(/Nome obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/E-mail obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/Senha obrigatória/i)).toBeInTheDocument();
    expect(await screen.findByText(/Confirmação obrigatória/i)).toBeInTheDocument();
  });

  it('exibe erro vindo do servidor', async () => {
    render(<SignUpForm onClose={vi.fn()} />);
    // Simular erro de senha fraca
    fireEvent.change(screen.getByLabelText(/Nome completo/i), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'teste@teste.com' } });
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar senha/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));
    expect(await screen.findByText(/Senha obrigatória/i)).toBeInTheDocument();
  });

  it('chama signIn ao submeter com dados válidos', async () => {
    const { signIn } = await import('next-auth/react');
    render(<SignUpForm onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Nome completo/i), { target: { value: 'Usuário Teste' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'teste@teste.com' } });
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'SenhaForte123!' } });
    fireEvent.change(screen.getByLabelText(/Confirmar senha/i), { target: { value: 'SenhaForte123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar conta/i }));
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', expect.objectContaining({ email: 'teste@teste.com', password: 'SenhaForte123!', name: 'Usuário Teste', isSignUp: 'true', redirect: false }));
    });
  });
}); 