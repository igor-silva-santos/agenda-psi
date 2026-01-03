"use client";

import { X } from 'lucide-react';
import SignUpForm from '@/components/SignUpForm';

interface SignUpModalProps {
  showModal: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function SignUpModal({ showModal, onClose, onOpenLogin }: SignUpModalProps) {
  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-0">
      <div className="w-full max-w-lg mx-auto bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in-scale overflow-auto p-0 relative max-h-[90vh] sm:px-0 px-2">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
          aria-label="Fechar modal de registro"
        >
          <X className="h-8 w-8" />
        </button>
        <div className="px-2 sm:px-8 py-10 flex flex-col items-center justify-center w-full">
          <SignUpForm onClose={onClose} onOpenLogin={onOpenLogin} />
        </div>
      </div>
    </div>
  );
}
