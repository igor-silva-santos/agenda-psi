import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminPacientesPage from '../page';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('next/link', () => ({ __esModule: true, default: ({ children }: any) => <a>{children}</a> }));

describe('AdminPacientesPage', () => {
  it('renderiza a página e mensagem de loading', () => {
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [[], vi.fn()]) // pacientes
      .mockImplementationOnce(() => [true, vi.fn()]) // loading
      .mockImplementationOnce(() => [null, vi.fn()]) // error
      .mockImplementationOnce(() => [null, vi.fn()]) // editingUser
      .mockImplementationOnce(() => [false, vi.fn()]) // isModalOpen
      .mockImplementationOnce(() => ['', vi.fn()]); // searchTerm
    render(<AdminPacientesPage />);
    expect(screen.getByText(/Gerenciar Pacientes/i)).toBeInTheDocument();
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('exibe mensagem de erro', () => {
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [[], vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => ['Erro ao buscar', vi.fn()])
      .mockImplementationOnce(() => [null, vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => ['', vi.fn()]);
    render(<AdminPacientesPage />);
    expect(screen.getByText(/Erro ao buscar/i)).toBeInTheDocument();
  });

  it('exibe lista de pacientes', async () => {
    render(<AdminPacientesPage />);
    expect(await screen.findByTestId('titulo-pacientes')).toBeInTheDocument();
    expect(await screen.findByTestId('paciente-nome-1')).toBeInTheDocument();
    expect(await screen.findByTestId('paciente-nome-2')).toBeInTheDocument();
  });
}); 