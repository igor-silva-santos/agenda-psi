import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MeusAgendamentosPage from '../page';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import '@testing-library/jest-dom';

beforeAll(() => {
  global.fetch = vi.fn(() => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: '',
      clone: () => response,
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      text: async () => '',
      bytes: async () => new Uint8Array(),
      json: async () => [],
    };
    return Promise.resolve(response);
  });
});

describe('MeusAgendamentosPage', () => {
  it('renderiza a página e mensagem de loading', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => new Promise(() => {}));
    render(<MeusAgendamentosPage />);
    expect(await screen.findByTestId('titulo-agendamentos')).toBeInTheDocument();
    expect(await screen.findByTestId('loading')).toBeInTheDocument();
  });

  it('exibe mensagem de erro', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.reject('Erro ao buscar'));
    render(<MeusAgendamentosPage />);
    await waitFor(() => expect(screen.getByTestId('erro')).toBeInTheDocument());
  });

  it('exibe mensagem de nenhuma consulta futura', async () => {
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
    render(<MeusAgendamentosPage />);
    expect(await screen.findByTestId('vazio-proximas')).toBeInTheDocument();
  });

  it('exibe mensagem de nenhum histórico de consultas', async () => {
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
    render(<MeusAgendamentosPage />);
    expect(await screen.findByTestId('vazio-historico')).toBeInTheDocument();
  });
}); 