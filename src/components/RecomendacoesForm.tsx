"use client";

import { useState } from "react";
import { Agendamento } from "@prisma/client";

export default function RecomendacoesForm({
  initialRecomendacoes,
  onSave,
}: {
  initialRecomendacoes: string;
  onSave: (recomendacoes: string) => Promise<void>;
}) {
  const [recomendacoes, setRecomendacoes] = useState(initialRecomendacoes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(recomendacoes);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={recomendacoes}
        onChange={(e) => setRecomendacoes(e.target.value)}
        className="w-full p-2 border rounded-lg text-gray-900"
        rows={3}
        placeholder="Adicionar recomendações..."
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar Recomendações"}
      </button>
    </form>
  );
}