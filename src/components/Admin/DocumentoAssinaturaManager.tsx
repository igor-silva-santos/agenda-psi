'use client';

import { useEffect, useState } from 'react';
import { Loader2, Send, Copy, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Badge from '@/components/ui/Badge';

interface Documento {
  id: string;
  tipoDocumento: string;
  assinado: boolean;
  assinadoEm: string | null;
  expiresAt: string;
  token: string;
  createdAt: string;
}

const TEMPLATE_PADRAO = `<h2>Termo de Consentimento</h2>
<p>Declaro estar ciente e de acordo com os termos do atendimento psicológico prestado.</p>
<p>Autorizo o registro e o tratamento dos meus dados conforme a política de privacidade.</p>`;

export default function DocumentoAssinaturaManager({ pacienteId }: { pacienteId: string }) {
  const { addToast } = useToast();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoDocumento, setTipoDocumento] = useState('TERMO_CONSENTIMENTO');
  const [conteudoHtml, setConteudoHtml] = useState(TEMPLATE_PADRAO);
  const [enviando, setEnviando] = useState(false);

  const fetchDocumentos = () => {
    setLoading(true);
    fetch(`/api/admin/pacientes/${pacienteId}/documento`)
      .then(res => res.json())
      .then(setDocumentos)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (pacienteId) fetchDocumentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  const handleEnviar = async () => {
    setEnviando(true);
    try {
      const res = await fetch(`/api/admin/pacientes/${pacienteId}/documento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoDocumento, conteudoHtml }),
      });
      if (!res.ok) {
        const data = await res.json();
        addToast(data.error || 'Erro ao enviar documento.', 'error');
        return;
      }
      addToast('Documento enviado para assinatura!', 'success');
      fetchDocumentos();
    } catch {
      addToast('Erro de conexão.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  const copiarLink = (token: string) => {
    const url = `${window.location.origin}/documento/${token}`;
    navigator.clipboard.writeText(url);
    addToast('Link copiado para a área de transferência.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Tipo de documento</label>
          <select
            value={tipoDocumento}
            onChange={e => setTipoDocumento(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
          >
            <option value="TERMO_CONSENTIMENTO">Termo de Consentimento</option>
            <option value="AUTORIZACAO_IMAGEM">Autorização de Imagem</option>
            <option value="OUTRO">Outro</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Conteúdo (HTML)</label>
          <textarea
            value={conteudoHtml}
            onChange={e => setConteudoHtml(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
          />
        </div>
      </div>
      <button
        onClick={handleEnviar}
        disabled={enviando}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
      >
        {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Enviar para assinatura
      </button>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Histórico</h3>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        ) : documentos.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum documento enviado ainda.</p>
        ) : (
          <div className="space-y-2">
            {documentos.map(d => (
              <div key={d.id} className="flex items-center justify-between gap-3 text-sm border border-gray-100 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{d.tipoDocumento}</span>
                  {d.assinado ? (
                    <Badge variant="success"><CheckCircle className="h-3 w-3 inline mr-1" />Assinado</Badge>
                  ) : (
                    <Badge variant="warning"><Clock className="h-3 w-3 inline mr-1" />Pendente</Badge>
                  )}
                </div>
                {!d.assinado && (
                  <button onClick={() => copiarLink(d.token)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs">
                    <Copy className="h-3.5 w-3.5" /> Copiar link
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
