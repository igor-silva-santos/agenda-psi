import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 horas

export function useInactivityLogout() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        // Limpar sessão (opcional: pode chamar signOut do next-auth)
        router.push('/conta/login?error=inactivity');
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