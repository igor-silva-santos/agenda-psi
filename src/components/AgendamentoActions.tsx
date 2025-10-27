"use client";

import { Agendamento } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function AgendamentoActions({ agendamento }: { agendamento: Agendamento }) {
  const router = useRouter();

  const handleUpdateStatus = async (status: string) => {
    await fetch(`/api/agendamentos/${agendamento.id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  };

  if (agendamento.status === "PENDENTE") {
    return (
      <div className="flex gap-2 mt-2">
        <button onClick={() => handleUpdateStatus("CONFIRMADO")} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Confirmar
        </button>
        <button onClick={() => handleUpdateStatus("CANCELADO")} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          Cancelar
        </button>
      </div>
    );
  }

  return null;
}