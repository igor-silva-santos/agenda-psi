import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock de useRouter
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
  }),
}));

// Mock de next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '',
}));


// Variáveis de ambiente para o Supabase
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key';
;
import { beforeAll, vi } from 'vitest';

beforeAll(() => {
  global.fetch = vi.fn((url, options) => {
    // Simula respostas para rotas conhecidas
    if (typeof url === 'string') {
      if (url.includes('/api/admin/pacientes')) {
        let response: any;
        response = {
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          redirected: false,
          type: 'basic' as ResponseType,
          url,
          clone: () => response,
          body: null,
          bodyUsed: false,
          arrayBuffer: async () => new ArrayBuffer(0),
          blob: async () => new Blob(),
          formData: async () => new FormData(),
          text: async () => '',
          bytes: async () => new Uint8Array(),
          json: async () => [
            { id: 1, nome: 'Paciente 1', email: 'paciente1@example.com', telefone: '11999999999', cpf: '123.456.789-00' },
            { id: 2, nome: 'Paciente 2', email: 'paciente2@example.com', telefone: '11988888888', cpf: '987.654.321-00' },
          ],
        };
        return Promise.resolve(response);
      }
      if (url.includes('/api/admin/horarios-bloqueados')) {
        let response: any;
        response = {
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          redirected: false,
          type: 'basic' as ResponseType,
          url,
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
      }
      if (url.includes('/api/portal/agendamentos')) {
        let response: any;
        response = {
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          redirected: false,
          type: 'basic' as ResponseType,
          url,
          clone: () => response,
          body: null,
          bodyUsed: false,
          arrayBuffer: async () => new ArrayBuffer(0),
          blob: async () => new Blob(),
          formData: async () => new FormData(),
          text: async () => '',
          bytes: async () => new Uint8Array(),
          json: async () => [
            { id: '1', dataHora: new Date(Date.now() + 86400000).toISOString(), status: 'CONFIRMADO', motivoConsulta: 'Consulta 1', recomendacao: 'Recomendação 1' },
            { id: '2', dataHora: new Date(Date.now() - 86400000).toISOString(), status: 'REALIZADO', motivoConsulta: 'Consulta 2', recomendacao: 'Recomendação 2' },
          ],
        };
        return Promise.resolve(response);
      }
      if (url.includes('/api/agendamentos/') && url.includes('/recomendacoes')) {
        let response: any;
        response = {
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          redirected: false,
          type: 'basic' as ResponseType,
          url,
          clone: () => response,
          body: null,
          bodyUsed: false,
          arrayBuffer: async () => new ArrayBuffer(0),
          blob: async () => new Blob(),
          formData: async () => new FormData(),
          text: async () => '',
          bytes: async () => new Uint8Array(),
          json: async () => ({ texto: 'Recomendação mockada' }),
        };
        return Promise.resolve(response);
      }
    }
    // Default: retorna array vazio
    let response: any;
    response = {
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
      json: async () => [],
    };
    return Promise.resolve(response);
  });
});
