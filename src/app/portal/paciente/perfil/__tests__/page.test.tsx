import React from 'react';
import { render, screen } from '@/../src/__tests__/test-utils';
import MeuPerfilPage from '../page';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

describe('MeuPerfilPage', () => {
  it('renderiza a página e mensagem de loading', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => new Promise(() => {}));
    render(<MeuPerfilPage />);
    expect(await screen.findByTestId('titulo-perfil')).toBeInTheDocument();
    expect(await screen.findByTestId('loading')).toBeInTheDocument();
  });

  it('exibe mensagem de erro', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() => Promise.reject('Erro ao buscar'));
    render(<MeuPerfilPage />);
    expect(await screen.findByTestId('erro')).toBeInTheDocument();
  });

  it('exibe formulário de perfil', async () => {
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
      json: async () => ({ name: 'Paciente Teste', cpf: '123.456.789-00', image: '' }),
    }));
    render(<MeuPerfilPage />);
    expect(await screen.findByTestId('form-perfil')).toBeInTheDocument();
  });
}); 