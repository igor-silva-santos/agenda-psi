import React from 'react';
import Modal from 'C:/Users/igord/OneDrive/Documentos/pscicologa/psicologa-agendamento/src/components/Modal';
import Button from '@/components/ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar' 
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={onClose}>Não</Button>
          <Button variant="secondary" onClick={onConfirm}>Sim</Button>
        </div>
      </div>
    </Modal>
  );
}
