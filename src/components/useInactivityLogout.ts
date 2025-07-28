import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 horas

export function useInactivityLogout() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        try {
          // Fazer logout limpo
          await signOut({ 
            redirect: false,
            callbackUrl: '/conta/login?error=inactivity'
          });
          router.push('/conta/login?error=inactivity');
        } catch (error) {
          console.error('Erro ao fazer logout por inatividade:', error);
          router.push('/conta/login?error=inactivity');
        }
      }, INACTIVITY_LIMIT_MS);
    };

    // Eventos de interação
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // Inicializa timer

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [router]);
} 