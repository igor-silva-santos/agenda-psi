import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, MessageSquare, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  id: string;
  dataHora: Date | string;
  recomendacao: string;
  status?: string;
  motivoConsulta?: string;
  className?: string;
}

export default function RecommendationCard({
  id,
  dataHora,
  recomendacao,
  status = 'CONFIRMADO',
  motivoConsulta,
  className
}: RecommendationCardProps) {
  const date = typeof dataHora === 'string' ? new Date(dataHora) : dataHora;
  const isCompleted = new Date(dataHora) < new Date();

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Consulta de {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
              <p className="text-sm text-gray-600 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{format(date, "HH:mm", { locale: ptBR })}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isCompleted && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 rounded-full">
                <Star className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Concluída</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {motivoConsulta && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Motivo da Consulta</h4>
            <p className="text-gray-600 text-sm bg-gray-50 px-3 py-2 rounded-lg">
              {motivoConsulta}
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Recomendações da Dra. Jandira</h4>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 rounded-r-lg">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {recomendacao}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>ID: {id}</span>
          <span className="capitalize">{status.toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
} 