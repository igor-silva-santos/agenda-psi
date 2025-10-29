import React from 'react'; // Added comment to force rebuild
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
  iconBgColor?: string; // Adicionado
  iconColor?: string;   // Adicionado
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  className,
  onClick,
  iconBgColor = 'bg-blue-100', // Valor padrão
  iconColor = 'text-blue-600'   // Valor padrão
}: DashboardCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      let statusFilter = '';
      let scrollTo = '';
      if (title === 'Consultas Confirmadas') {
        statusFilter = 'CONFIRMADO';
        scrollTo = 'history';
      } else if (title === 'Consultas Pendentes') {
        statusFilter = 'PENDENTE';
        scrollTo = 'history';
      } else if (title === 'Consultas Canceladas') {
        statusFilter = 'CANCELADO';
        scrollTo = 'history';
      } else if (title === 'Consultas Realizadas') {
        statusFilter = 'REALIZADA';
        scrollTo = 'history';
      } else if (title === 'Total de Consultas') {
        statusFilter = '';
        scrollTo = 'history';
      }
      router.push(`/portal/paciente/agendamentos?status=${statusFilter}&date=month${scrollTo ? `&scrollTo=${scrollTo}` : ''}`);
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 min-h-32',
        onClick && 'cursor-pointer hover:border-blue-300',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex flex-col justify-between h-full"> {/* Contêiner principal vertical, justifica espaço */}
          <div> {/* Topo: Título */}
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          </div>
          <div className="flex justify-between items-center"> {/* Parte inferior: Valor à esquerda, Ícone à direita */} 
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBgColor)}>
              <Icon className={cn("w-6 h-6", iconColor)} />
            </div>
          </div>
        </div>
      </div>
    );
}