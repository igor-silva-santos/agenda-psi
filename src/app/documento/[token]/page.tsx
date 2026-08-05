'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, PenLine, Trash2, AlertCircle } from 'lucide-react';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';

interface DocumentoData {
  id: string;
  tipoDocumento: string;
  conteudoHtml: string;
  nomePaciente: string;
  expiresAt: string;
}

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string; jaAssinado?: boolean; expirado?: boolean }
  | { tipo: 'pronto'; data: DocumentoData }
  | { tipo: 'assinado' };

function formatarCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function SignatureCanvas({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [vazio, setVazio] = useState(true);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: ((e as MouseEvent).clientX - rect.left) * scaleX, y: ((e as MouseEvent).clientY - rect.top) * scaleY };
  };

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setVazio(false);
    onChange(canvas.toDataURL('image/png'));
  }, [onChange]);

  const stopDraw = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);
    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('mouseleave', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  const limpar = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setVazio(true);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-blue-200 rounded-xl overflow-hidden bg-white" style={{ touchAction: 'none' }}>
        <canvas ref={canvasRef} width={600} height={180} className="w-full cursor-crosshair block" style={{ display: 'block' }} />
        {vazio && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-300 text-sm flex items-center gap-2">
              <PenLine size={16} /> Assine aqui com o dedo ou mouse
            </span>
          </div>
        )}
      </div>
      {!vazio && (
        <button type="button" onClick={limpar} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
          <Trash2 size={13} /> Limpar assinatura
        </button>
      )}
    </div>
  );
}

export default function DocumentoAssinaturaPage() {
  const { token } = useParams<{ token: string }>();
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });
  const [cpf, setCpf] = useState('');
  const [aceito, setAceito] = useState(false);
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/documento/${token}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          setEstado({ tipo: 'erro', mensagem: data.error, jaAssinado: data.jaAssinado, expirado: data.expirado });
        } else {
          setEstado({ tipo: 'pronto', data });
        }
      })
      .catch(() => setEstado({ tipo: 'erro', mensagem: 'Não foi possível carregar o documento.' }));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm(null);

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!cpfValidator.isValid(cpfLimpo)) {
      setErroForm('CPF inválido. Verifique o número digitado.');
      return;
    }
    if (!assinatura) {
      setErroForm('Por favor, desenhe sua assinatura no campo acima.');
      return;
    }
    if (!aceito) {
      setErroForm('Você precisa marcar que leu e aceita o documento.');
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`/api/documento/${token}/assinar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfLimpo, imagemAssinatura: assinatura }),
      });
      const result = await res.json();
      if (!res.ok) {
        setErroForm(result.error || 'Erro ao salvar assinatura.');
      } else {
        setEstado({ tipo: 'assinado' });
      }
    } catch {
      setErroForm('Erro de conexão. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (estado.tipo === 'carregando') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-500">Carregando documento...</p>
        </div>
      </div>
    );
  }

  if (estado.tipo === 'erro') {
    const icon = estado.jaAssinado
      ? <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
      : <XCircle className="w-12 h-12 text-red-400 mx-auto" />;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          {icon}
          <h2 className="text-xl font-bold text-gray-800">{estado.jaAssinado ? 'Documento já assinado' : 'Link inválido'}</h2>
          <p className="text-gray-500">{estado.mensagem}</p>
        </div>
      </div>
    );
  }

  if (estado.tipo === 'assinado') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800">Documento assinado!</h2>
          <p className="text-gray-500">Sua assinatura foi registrada com sucesso. Você pode fechar esta página.</p>
          <p className="text-xs text-gray-400">O documento assinado ficará disponível no seu portal do paciente.</p>
        </div>
      </div>
    );
  }

  const { data } = estado;
  const expiresDate = new Date(data.expiresAt).toLocaleString('pt-BR');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <PenLine size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Assinatura Digital</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Olá, <strong>{data.nomePaciente}</strong>! Por favor, leia o documento abaixo com atenção antes de assinar.
          </p>
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle size={13} /> Este link expira em {expiresDate}.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div
            className="prose prose-sm max-w-none text-gray-700 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: data.conteudoHtml }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Seu CPF *</label>
              <input
                type="text"
                inputMode="numeric"
                value={cpf}
                onChange={e => setCpf(formatarCpf(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                placeholder="000.000.000-00"
                maxLength={14}
              />
              <p className="text-xs text-gray-400 mt-1">Confirme seu CPF para validar a identidade.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Assinatura *</label>
              <SignatureCanvas onChange={setAssinatura} />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aceito}
                onChange={e => setAceito(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Li o documento acima na íntegra e concordo com todos os seus termos.</span>
            </label>

            {erroForm && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                {erroForm}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {enviando ? (<><Loader2 size={20} className="animate-spin" /> Salvando assinatura...</>) : (<><PenLine size={20} /> Assinar Documento</>)}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">Assinatura digital com registro de IP e CPF validado.</p>
      </div>
    </div>
  );
}
