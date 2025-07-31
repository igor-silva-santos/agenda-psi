import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import { afterEach } from 'vitest';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';

// Mock useRouter
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    route: '/',
    pathname: '',
    query: '',
    asPath: '',
    push: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
  })),
}));

// Mock next-auth/react
vi.mock('next-auth/react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    SessionProvider: actual.SessionProvider, // Ensure SessionProvider is also exported
    useSession: vi.fn(() => ({
      data: { user: { name: 'Test User', email: 'test@example.com' } },
      status: 'authenticated',
    })),
  };
});

afterEach(() => {
  cleanup();
});

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => (
      <SessionProvider session={null}>{children}</SessionProvider>
    ),
    ...options,
  });

export { customRender as render };