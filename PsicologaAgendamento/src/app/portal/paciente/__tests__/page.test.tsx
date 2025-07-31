import React from 'react';
import { render, screen, waitFor } from '@/../src/__tests__/test-utils';
import PacienteDashboard from '../page';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href || '#'}>{children}</a> }));

describe('PacienteDashboard', () => {
  it('renderiza o dashboard e mensagem de loading', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => new Promise(() => {}));
    render(<PacienteDashboard />);
    expect(await screen.findByTestId('titulo-dashboard')).toBeInTheDocument();
    expect(await screen.findByTestId('loading')).toBeInTheDocument();
  });

  it('exibe mensagem de erro', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.reject('Erro ao buscar'));
    render(<PacienteDashboard />);
    await waitFor(() => expect(screen.getByTestId('erro')).toBeInTheDocument());
  });

  it('exibe mensagem de nenhuma consulta confirmada', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: '',
      clone: function () { return this; },
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => '',
      bytes: async () => new Uint8Array(),
      json: async () => [],
    }));
    render(<PacienteDashboard />);
    expect(await screen.findByTestId('vazio')).toBeInTheDocument();
  });

  it('exibe próxima consulta confirmada', () => {
    const agendamentos = [{ id: 1, dataHora: new Date(Date.now() + 86400000).toISOString(), status: 'CONFIRMADO' }];
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [agendamentos, vi.fn()]).mockImplementationOnce(() => [false, vi.fn()]).mockImplementationOnce(() => [null, vi.fn()]);
    render(<PacienteDashboard />);
    expect(screen.getByText(/Sua Próxima Consulta/i)).toBeInTheDocument();
  });
}); 