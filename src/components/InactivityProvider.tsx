"use client";
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useInactivityLogout } from './useInactivityLogout';

export function InactivityProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  // Só aplica o logout por inatividade se o usuário estiver autenticado
  if (status === 'loading') {
    return <>{children}</>;
  }
  
  if (session?.user) {
    useInactivityLogout();
  }
  
  return <>{children}</>;
} 