'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, CheckCircle, ExternalLink, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  mensagem: string;
  lida: boolean;
  linkRedirecionamento: string | null;
  dataCriacao: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notificacoes?lida=false');
      if (response.ok) {
        const data: Notification[] = await response.json();
        setNotifications(data.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()));
        setUnreadCount(data.length);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => { document.body.classList.remove('modal-open'); };
    }
  }, [isOpen]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await fetch(`/api/notificacoes/${notification.id}/ler`, { method: 'POST' });
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (notification.linkRedirecionamento) {
        router.push(notification.linkRedirecionamento);
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    } finally {
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notificacoes/ler-todas', { method: 'POST' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Notificações"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-semibold text-gray-800">
                Notificações
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-3 shrink-0">
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug">{notification.mensagem}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.dataCriacao), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-4">
                  <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Você está em dia!</p>
                  <p className="text-xs text-gray-400 mt-0.5">Nenhuma notificação não lida.</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-4 py-2.5 flex-shrink-0">
              <Link
                href={isAdmin ? '/admin' : '/portal/paciente/notificacoes'}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors py-1"
              >
                Ver todas as notificações
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationBell;
