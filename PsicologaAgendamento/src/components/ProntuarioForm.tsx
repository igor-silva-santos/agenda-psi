"use client";

import { useState } from "react";
import { User } from "@prisma/client";

export default function ProntuarioForm({
  initialProntuario,
  onSave,
  placeholder,
}: {
  initialProntuario: string;
  onSave: (prontuario: string) => Promise<void>;
  placeholder?: string;
}) {
  const [prontuario, setProntuario] = useState(initialProntuario);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(prontuario);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={prontuario}
        onChange={(e) => setProntuario(e.target.value)}
        className="w-full p-2 border rounded-lg text-gray-900"
        rows={10}
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar Prontuário"}
      </button>
    </form>
  );
}