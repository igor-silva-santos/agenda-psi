'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ModalContextType {
  showModal: (content: ReactNode) => void;
  hideModal: () => void;
  isModalOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);

  const hideModal = useCallback(() => {
    console.log('hideModal called');
    setModalContent(null);
    if (window.history.state && window.history.state.modalOpen) {
      window.history.back();
    }
  }, []);

  const showModal = useCallback((content: ReactNode) => {
    setModalContent(content);
    window.history.pushState({ modalOpen: true }, '');
  }, []);

  const isModalOpen = modalContent !== null;

  return (
    <ModalContext.Provider value={{ showModal, hideModal, isModalOpen }}>
      {children}
      {isModalOpen && modalContent}
    </ModalContext.Provider>
  );
}
