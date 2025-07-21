"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getProviders } from 'next-auth/react';
import SignInButtons from '@/components/SignInButtons';
import type { ClientSafeProvider } from 'next-auth/react';

interface LoginModalProps {
  showModal: boolean;
  onClose: () => void;
  onOpenSignUp: () => void;
}

export default function LoginModal({ showModal, onClose, onOpenSignUp }: LoginModalProps) {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-0">
      <div className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in-scale overflow-auto p-0 relative max-h-[90vh] sm:px-0 px-2">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
          aria-label="Fechar modal de login"
        >
          <X className="h-8 w-8" />
        </button>
        <div className="px-2 sm:px-8 py-10 flex flex-col items-center justify-center w-full">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 text-center tracking-tight drop-shadow-sm mb-8">Acesse sua Conta</h2>
          {providers && <SignInButtons providers={providers} onOpenSignUp={onOpenSignUp} />}
        </div>
      </div>
    </div>
  );
}