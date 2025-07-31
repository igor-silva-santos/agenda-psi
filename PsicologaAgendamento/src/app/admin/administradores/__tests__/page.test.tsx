import React from 'react';
import { render, screen } from '@/../src/__tests__/test-utils';
import AdminAdministradoresPage from '../page';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href || '#'}>{children}</a> }));

describe('AdminAdministradoresPage', () => {
  it('renderiza a página e mensagem de loading', () => {
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [[], vi.fn()]) // admins
      .mockImplementationOnce(() => [true, vi.fn()]) // loading
      .mockImplementationOnce(() => [null, vi.fn()]) // error
      .mockImplementationOnce(() => [null, vi.fn()]) // editingUser
      .mockImplementationOnce(() => [false, vi.fn()]) // isModalOpen
      .mockImplementationOnce(() => ['', vi.fn()]); // searchTerm
    render(<AdminAdministradoresPage />);
    expect(screen.getByText(/Gerenciar Administradores/i)).toBeInTheDocument();
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('exibe mensagem de erro', () => {
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [[], vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => ['Erro ao buscar', vi.fn()])
      .mockImplementationOnce(() => [null, vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => ['', vi.fn()]);
    render(<AdminAdministradoresPage />);
    expect(screen.getByText(/Erro ao buscar/i)).toBeInTheDocument();
  });

  it('exibe lista de administradores', () => {
    const admins = [
      { id: 1, name: 'Admin 1', email: 'admin1@teste.com', role: 'ADMIN' },
      { id: 2, name: 'Admin 2', email: 'admin2@teste.com', role: 'ADMIN' },
    ];
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [admins, vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => [null, vi.fn()])
      .mockImplementationOnce(() => [null, vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => ['', vi.fn()]);
    render(<AdminAdministradoresPage />);
    expect(screen.getByText(/Gerenciar Administradores/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin 2/i)).toBeInTheDocument();
  });
}); 