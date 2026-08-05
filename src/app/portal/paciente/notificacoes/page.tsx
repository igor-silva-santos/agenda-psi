'use client';

import { useEffect, useState } from 'react';
import { Loader2, Bell, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Card from '@/components/ui/Card';

interface Notification {
  id: string;
  tipo: string;
  mensagem: string;
  lida: boolean;
  linkRedirecionamento: string | null;
  dataCriacao: string;
}

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notificacoes');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const marcarComoLida = async (id: string) => {
    await fetch(`/api/notificacoes/${id}/ler`, { method: 'POST' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-full">
          <Bell className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notificações</h1>
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
          <p className="text-gray-600 font-medium">Você está em dia!</p>
          <p className="text-gray-400 text-sm mt-1">Nenhuma notificação até o momento.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={n.lida ? 'opacity-70' : 'border-blue-200'}
              padding="sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-700">{n.mensagem}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(n.dataCriacao), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                {!n.lida && (
                  <button
                    onClick={() => marcarComoLida(n.id)}
                    className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                  >
                    Marcar como lida
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
