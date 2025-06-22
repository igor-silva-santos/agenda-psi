'use client';

// CORREÇÃO: Este ficheiro continha variáveis não utilizadas e tipos 'any'.
// A versão abaixo está limpa e funcional, mas este componente parece não estar
// a ser utilizado no projeto principal, que usa 'AgendamentoFormMelhorado'.
// Considere apagar este ficheiro se ele não for necessário.

import { useState } from 'react';
import CalendarioAgendamento from './CalendarioAgendamento';
import { useForm } from 'react-hook-form';

interface FormData {
  nome: string;
  whatsapp: string;
}

export default function AgendamentoForm() {
  const [dataSelecionada] = useState(new Date()); // setDataSelecionada removido pois não era usado
  const { register, handleSubmit } = useForm<FormData>();

  const onAgendar = (dados: FormData) => {
    console.log({ ...dados, data: dataSelecionada });
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