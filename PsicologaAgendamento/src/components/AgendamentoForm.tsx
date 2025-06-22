'use client';

// CORREÇÃO: Este ficheiro continha variáveis não utilizadas.
// Ele parece ser um componente legado/antigo.
// A versão limpa está abaixo. Se não o estiver a usar, pode apagá-lo.

import { useState } from 'react';
import CalendarioAgendamento from './CalendarioAgendamento';
import { useForm } from 'react-hook-form';

export default function AgendamentoForm() {
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const { register, handleSubmit } = useForm();

  const onAgendar = (dados: any) => {
    console.log(dados);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Agendar Consulta</h2>
      <CalendarioAgendamento onSelect={(date, time) => console.log(date, time)} />
      <form onSubmit={handleSubmit(onAgendar)} className="mt-4 space-y-4">
        <div>
          <label>Data: {dataSelecionada.toLocaleDateString()}</label>
        </div>
        <div>
          <label htmlFor="nome" className="block">Nome</label>
          <input id="nome" {...register('nome')} className="border p-2 w-full" />
        </div>
        <div>
          <label htmlFor="whatsapp" className="block">WhatsApp</label>
          <input id="whatsapp" {...register('whatsapp')} className="border p-2 w-full" />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Agendar
        </button>
      </form>
    </div>
  );
}