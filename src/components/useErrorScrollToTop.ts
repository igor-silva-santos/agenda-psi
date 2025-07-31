import { useEffect } from 'react';

export function useErrorScrollToTop(error: string | null | undefined) {
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);
} 