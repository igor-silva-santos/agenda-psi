'use client';

import { X } from 'lucide-react';
import { Fragment, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Travar scroll do fundo quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Fragment>
      <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-60 flex justify-center items-center z-40 transition-opacity duration-300 overflow-hidden" onClick={onClose} />
      <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-50 p-0 overflow-hidden">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-3xl flex flex-col animate-fade-in-scale"
          onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 sm:p-6 flex-1">
            {children}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

// Adicione isso ao seu arquivo CSS global (ex: globals.css) para a animação
/*
@keyframes fade-in-scale {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-scale {
  animation: fade-in-scale 0.2s ease-out forwards;
}
*/
