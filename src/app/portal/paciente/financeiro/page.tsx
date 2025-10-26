'use client';

import { Wrench } from 'lucide-react';

export default function FinanceiroPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <div className="p-6 bg-gray-100 rounded-full">
        <Wrench className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-gray-700">Página em Construção</h2>
      <p className="mt-2 text-base text-gray-500">A seção Financeiro está sendo preparada e estará disponível em breve.</p>
    </div>
  );
}
