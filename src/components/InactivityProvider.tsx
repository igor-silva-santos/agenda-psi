"use client";
import { ReactNode } from 'react';
import { useInactivityLogout } from './useInactivityLogout';

export function InactivityProvider({ children }: { children: ReactNode }) {
  useInactivityLogout();
  return <>{children}</>;
} 