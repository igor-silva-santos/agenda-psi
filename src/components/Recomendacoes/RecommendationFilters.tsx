import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecommendationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  className?: string;
}

export default function RecommendationFilters({
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  className
}: RecommendationFiltersProps) {
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6",
      className
    )}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar nas recomendações..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="md:w-48">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Todas as datas</option>
              <option value="last-30">Últimos 30 dias</option>
              <option value="last-90">Últimos 90 dias</option>
              <option value="last-6-months">Últimos 6 meses</option>
              <option value="last-year">Último ano</option>
            </select>
          </div>
        </div>

        {/* Filter Icon */}
        <div className="flex items-center justify-center md:w-12">
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
} 