'use client';

import React, { useEffect, useState } from 'react';
// This is a new line to force Vercel rebuild
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { ToastMessage, ToastType } from '@/context/ToastContext';

interface ToastProps extends ToastMessage {
  onDismiss: () => void;
}

export default function Toast({ id, message, type, onDismiss }: ToastProps) {
  const bgColorClass = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[type];

  const IconComponent = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: TriangleAlert,
  }[type];

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg shadow-lg text-white ${bgColorClass} animate-fade-in-up min-w-[250px] max-w-xs`}
      role="alert"
    >
      <div className="flex items-center">
        {IconComponent && <IconComponent className="h-5 w-5 mr-2" />}
        <span>{message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="ml-4 text-white opacity-75 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full p-1"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
