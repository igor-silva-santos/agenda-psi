'use client';

import { useEffect, useState } from 'react';
import { Loader2, FileText, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
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

export default function MeusDocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/meus-documentos')
      .then(res => res.json())
      .then(setDocumentos)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-full">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Meus Documentos</h1>
      </div>

      {documentos.length === 0 ? (
        <Card className="text-center py-12 text-gray-500">Nenhum documento até o momento.</Card>
      ) : (
        <div className="space-y-3">
          {documentos.map((d) => {
            const expirado = !d.assinado && new Date(d.expiresAt) < new Date();
            return (
              <Card key={d.id} padding="sm">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium text-gray-900">{d.tipoDocumento}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {d.assinado ? (
                        <Badge variant="success">Assinado {d.assinadoEm ? `em ${new Date(d.assinadoEm).toLocaleDateString('pt-BR')}` : ''}</Badge>
                      ) : expirado ? (
                        <Badge variant="danger">Link expirado</Badge>
                      ) : (
                        <Badge variant="warning">Aguardando assinatura</Badge>
                      )}
                    </div>
                  </div>
                  {!d.assinado && !expirado && (
                    <a
                      href={`/documento/${d.token}`}
                      className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Assinar agora <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
