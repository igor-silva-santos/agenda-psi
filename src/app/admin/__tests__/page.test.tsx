import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminDashboard from '../page';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('next/link', () => ({ __esModule: true, default: ({ children }: any) => <a>{children}</a> }));

describe('AdminDashboard', () => {
  it('renderiza o painel e mensagem de loading', () => {
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [[], vi.fn()]) // agendamentos
      .mockImplementationOnce(() => [true, vi.fn()]) // loading
      .mockImplementationOnce(() => [null, vi.fn()]) // error
      .mockImplementationOnce(() => [{ totalHoje: 0, confirmados: 0, pendentes: 0 }, vi.fn()]); // stats
    render(<AdminDashboard />);
    expect(screen.getByText(/Painel Administrativo/i)).toBeInTheDocument();
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('exibe mensagem de erro', () => {
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [[], vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => ['Erro ao buscar', vi.fn()])
      .mockImplementationOnce(() => [{ totalHoje: 0, confirmados: 0, pendentes: 0 }, vi.fn()]);
    render(<AdminDashboard />);
    expect(screen.getByText(/Erro ao buscar/i)).toBeInTheDocument();
  });

  it('exibe estatísticas e lista de agendamentos', () => {
    const agendamentos = [
      { id: 1, dataHora: new Date().toISOString(), status: 'CONFIRMADO', user: { name: 'Paciente 1', email: 'paciente1@teste.com' } },
      { id: 2, dataHora: new Date().toISOString(), status: 'PENDENTE', user: { name: 'Paciente 2', email: 'paciente2@teste.com' } },
    ];
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [agendamentos, vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => [null, vi.fn()])
      .mockImplementationOnce(() => [{ totalHoje: 2, confirmados: 1, pendentes: 1 }, vi.fn()]);
    render(<AdminDashboard />);
    expect(screen.getByText(/Painel Administrativo/i)).toBeInTheDocument();
    expect(screen.getByText(/Agendamentos Hoje/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmados Hoje/i)).toBeInTheDocument();
    expect(screen.getByText(/Pendentes Hoje/i)).toBeInTheDocument();
    expect(screen.getByText(/Próximos Agendamentos do Dia/i)).toBeInTheDocument();
    expect(screen.getByText(/Paciente 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Paciente 2/i)).toBeInTheDocument();
  });
}); 