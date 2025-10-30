import React from 'react';
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={{
      expires: '1',
      accessToken: 'test-token',
      user: {
        email: 'test@example.com',
        name: 'Test User',
        id: '1',
        role: 'USER',
        cpf: '123.456.789-00',
        telefone: '11999999999'
      }
    }}>
      {children}
    </SessionProvider>
  );
};

const customRender = (ui: React.ReactElement, options?: any) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
