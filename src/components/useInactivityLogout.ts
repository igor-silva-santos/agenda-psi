import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 horas

export function useInactivityLogout(user?: any) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return; // Só ativa se usuário estiver autenticado

    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        try {
          await signOut({ redirect: false, callbackUrl: '/conta/login?error=inactivity' });
          router.push('/conta/login?error=inactivity');
        } catch (error) {
          router.push('/conta/login?error=inactivity');
        }
      }, INACTIVITY_LIMIT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [router, user]);
} 