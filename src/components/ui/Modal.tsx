'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  const modalRootRef = useRef<HTMLElement | null>(null);

  // Initialize modalRootRef after component mounts
  useEffect(() => {
    modalRootRef.current = document.getElementById('modal-root');
  }, []);

  // All other hooks must be called unconditionally after this point

  // Add/remove modal-open class to body
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Handle mobile back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!event.state || !event.state.modalOpen) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);

  if (!modalRootRef.current) { // Conditionally render createPortal
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 w-screen h-screen"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-h-[95vh] bg-white rounded-2xl shadow-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    modalRootRef.current
  );
}
