import React from 'react';
import { render, screen } from '@/../src/__tests__/test-utils';
import AdminAgendamentosPage from '../page';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('next/link', () => ({ __esModule: true, default: ({ children }: any) => <a>{children}</a> }));

describe('AdminAgendamentosPage', () => {
  it('renderiza a página e mensagem de loading', () => {
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [[], vi.fn()]) // agendamentos
      .mockImplementationOnce(() => [true, vi.fn()]) // loading
      .mockImplementationOnce(() => [null, vi.fn()]) // error
      .mockImplementationOnce(() => ['', vi.fn()]) // filterStatus
      .mockImplementationOnce(() => ['week', vi.fn()]) // filterRange
      .mockImplementationOnce(() => ['', vi.fn()]); // searchTerm
    render(<AdminAgendamentosPage />);
    expect(screen.getByText(/Gerenciar Agendamentos/i)).toBeInTheDocument();
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('exibe mensagem de erro', () => {
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [[], vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => ['Erro ao buscar', vi.fn()])
      .mockImplementationOnce(() => ['', vi.fn()])
      .mockImplementationOnce(() => ['week', vi.fn()])
      .mockImplementationOnce(() => ['', vi.fn()]);
    render(<AdminAgendamentosPage />);
    expect(screen.getByText(/Erro ao buscar/i)).toBeInTheDocument();
  });

  it('exibe lista de agendamentos', () => {
    const agendamentos = [
      { id: 1, dataHora: new Date().toISOString(), status: 'CONFIRMADO', user: { name: 'Paciente 1', email: 'paciente1@teste.com' } },
      { id: 2, dataHora: new Date().toISOString(), status: 'PENDENTE', user: { name: 'Paciente 2', email: 'paciente2@teste.com' } },
    ];
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [agendamentos, vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => [null, vi.fn()])
      .mockImplementationOnce(() => ['', vi.fn()])
      .mockImplementationOnce(() => ['week', vi.fn()])
      .mockImplementationOnce(() => ['', vi.fn()]);
    render(<AdminAgendamentosPage />);
    expect(screen.getByText(/Gerenciar Agendamentos/i)).toBeInTheDocument();
    expect(screen.getByText(/Paciente 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Paciente 2/i)).toBeInTheDocument();
  });
}); 