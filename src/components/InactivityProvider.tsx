"use client";
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useInactivityLogout } from './useInactivityLogout';

export function InactivityProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  // Chame sempre o hook, mas ele só ativa se o usuário estiver autenticado
  useInactivityLogout(session?.user);
  return <>{children}</>;
} 