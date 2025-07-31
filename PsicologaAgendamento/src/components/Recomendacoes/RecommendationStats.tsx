import React from 'react';
import { MessageSquare, Calendar, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationStatsProps {
  totalRecommendations: number;
  recentRecommendations: number;
  averageLength: number;
  lastRecommendation?: Date;
  className?: string;
}

export default function RecommendationStats({
  totalRecommendations,
  recentRecommendations,
  averageLength,
  lastRecommendation,
  className
}: RecommendationStatsProps) {
  const stats = [
    {
      label: 'Total de Recomendações',
      value: totalRecommendations,
      icon: MessageSquare,
      color: 'blue'
    },
    {
      label: 'Últimos 30 dias',
      value: recentRecommendations,
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Média de Caracteres',
      value: averageLength,
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'Última Recomendação',
      value: lastRecommendation ? new Date(lastRecommendation).toLocaleDateString('pt-BR') : 'N/A',
      icon: Clock,
      color: 'orange'
    }
  ];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = {
          blue: 'bg-blue-50 text-blue-600',
          green: 'bg-green-50 text-green-600',
          purple: 'bg-purple-50 text-purple-600',
          orange: 'bg-orange-50 text-orange-600'
        };

        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={cn("p-3 rounded-lg", colorClasses[stat.color as keyof typeof colorClasses])}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 