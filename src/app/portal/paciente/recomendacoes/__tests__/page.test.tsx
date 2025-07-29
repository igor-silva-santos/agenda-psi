import React from 'react';
import { render, screen, waitFor } from '@/../src/__tests__/test-utils';
import MinhasRecomendacoesPage from '../page';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import '@testing-library/jest-dom';

beforeAll(() => {
  global.fetch = vi.fn((url) => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: typeof url === 'string' ? url : '',
      clone: () => response,
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => '',
      bytes: async () => new Uint8Array(),
      json: async () => {
        if (typeof url === 'string' && url.includes('/api/agendamentos/')) {
          return { texto: 'Recomendação mockada' };
        }
        return [];
      },
    };
    return Promise.resolve(response);
  });
});

describe('MinhasRecomendacoesPage', () => {
  it('renderiza a página e mensagem de loading', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => new Promise(() => {}));
    render(<MinhasRecomendacoesPage />);
    expect(await screen.findByTestId('titulo-recomendacoes')).toBeInTheDocument();
    expect(await screen.findByTestId('loading')).toBeInTheDocument();
  });

  it('exibe mensagem de erro', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.reject('Erro ao buscar'));
    render(<MinhasRecomendacoesPage />);
    await waitFor(() => expect(screen.getByTestId('erro')).toBeInTheDocument());
  });

  it('exibe mensagem de nenhuma recomendação', async () => {
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
    render(<MinhasRecomendacoesPage />);
    expect(await screen.findByTestId('vazio')).toBeInTheDocument();
  });

  it('exibe recomendações', async () => {
    const agendamentos = [
      { id: 1, dataHora: new Date(Date.now() - 86400000).toISOString(), recomendacao: 'Recomendação 1' },
      { id: 2, dataHora: new Date(Date.now() - 172800000).toISOString(), recomendacao: 'Recomendação 2' },
    ];
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [agendamentos, vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()])
      .mockImplementationOnce(() => [null, vi.fn()]);
    render(<MinhasRecomendacoesPage />);
    expect(await screen.findByTestId('titulo-recomendacoes')).toBeInTheDocument();
    expect(await screen.findByText(/Recomendação 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Recomendação 2/i)).toBeInTheDocument();
  });
}); 