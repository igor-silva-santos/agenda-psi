'use client';

import React, { useState, useRef, useEffect } from 'react'; // Added comment to force rebuild
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BookableSlotPicker from './BookableSlotPicker';
import { BookableSlot } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Loader2, X } from 'lucide-react';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/context/ToastContext';
import { useErrorScrollToTop } from './useErrorScrollToTop';

const cleanCpf = (cpf: string) => cpf.replace(/\D/g, '');
const formatCpf = (cpf: string) => {
  cpf = cleanCpf(cpf);
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
};

const agendamentoStep1Schema = z.object({
  slotId: z.string({ required_error: 'Por favor, selecione um horário.' }),
});

const agendamentoStep2Schema = z.object({
  cpf: z.string().refine((value) => cpfValidator.isValid(value), { message: 'CPF inválido.' }),
  nomeCompleto: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  dataNascimento: z.string().min(8, { message: 'Data de nascimento obrigatória.' }),
  email: z.string().min(1, { message: 'O e-mail é obrigatório.' }).email('Formato de e-mail inválido.'),
  senha: z.string().optional(),
  telefone: z.string().min(10, 'Telefone obrigatório.'),
  motivoConsulta: z.string().optional(),
});

function formatTelefone(value: string) {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
}

interface AgendamentoFormMelhoradoProps {
  onClose: () => void; // Para o botão 'X' do modal
  onSuccess: (message: string) => void;
}

export default function AgendamentoFormMelhorado({ onClose, onSuccess }: AgendamentoFormMelhoradoProps) {
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const timeSlotsRef = useRef<HTMLDivElement>(null);
  const [displayCpf, setDisplayCpf] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [camposBloqueados, setCamposBloqueados] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaErro, setSenhaErro] = useState('');

  useErrorScrollToTop(error);

  const { control: controlStep1, handleSubmit: handleSubmitStep1, formState: { errors: errorsStep1 } } = useForm({
    resolver: zodResolver(agendamentoStep1Schema),
    mode: 'onChange',
  });

  const { control: controlStep2, handleSubmit: handleSubmitStep2, setValue: setValueStep2, watch: watchStep2, formState: { errors: errorsStep2 } } = useForm({
    resolver: zodResolver(agendamentoStep2Schema),
    mode: 'onChange',
  });

  const password = watchStep2('senha') || '';

  const handleAuthenticatedBooking = async () => {
    if (!selectedSlot) {
      setError("Por favor, selecione um horário.");
      return;
    }
    if (status !== 'authenticated') {
      setError("Sessão inválida.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const agendamentoRes = await fetch('/api/portal/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot?.id || selectedSlot,
          motivoConsulta: 'Agendamento via portal do paciente',
        }),
      });
      const result = await agendamentoRes.json();
      if (!agendamentoRes.ok) throw new Error(result?.error || 'Erro ao agendar.');
      onSuccess('Agendamento pré-realizado! Por favor, confirme a consulta na sua lista de agendamentos.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1Submit = () => {
    if (status === 'authenticated') {
      handleAuthenticatedBooking();
    } else {
      setStep(2);
    }
  };

  const checkPacienteExiste = async (cpf: string) => {
    if (!cpf || cpf.length < 11) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pacientes/${cpf}`);
      if (res.ok) {
        const data = await res.json();
        if (data.role === 'ADMIN') {
          setError('Não é possível agendar consulta para um usuário administrador.');
          setUserData(null);
          setValueStep2('nomeCompleto', '');
          setValueStep2('dataNascimento', '');
          setValueStep2('email', '');
          setValueStep2('telefone', '');
          setCamposBloqueados(false);
          return;
        }
        setUserData(data);
        setCamposBloqueados(true);
        const nomeCorreto = data.name || data.nomeCompleto || data.nome || '';
        setValueStep2('nomeCompleto', nomeCorreto);
        setValueStep2('dataNascimento', data.dataNascimento ? data.dataNascimento.substring(0, 10) : '');
        setValueStep2('email', data.email);
        setValueStep2('telefone', data.telefone || data.phone || '');
      } else {
        setUserData(null);
        setCamposBloqueados(false);
        setValueStep2('nomeCompleto', '');
        setValueStep2('dataNascimento', '');
        setValueStep2('email', '');
        setValueStep2('telefone', '');
      }
    } catch (err: any) {
      setError('Erro ao validar CPF.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgendar = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        slotId: selectedSlot?.id || selectedSlot,
      };

      const agendamentoRes = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await agendamentoRes.json();
      if (!agendamentoRes.ok) {
        throw new Error(result?.error || 'Erro ao processar agendamento.');
      }

      onSuccess('Agendamento pré-realizado! Por favor, confirme a consulta na sua lista de agendamentos.');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getSlotLabel = () => {
    if (!selectedSlot) return '';
    const date = typeof selectedSlot.dataHora === 'string' ? parseISO(selectedSlot.dataHora) : selectedSlot.dataHora;
    return date ? `${format(date, 'dd/MM/yyyy')} às ${format(date, 'HH:mm')}` : '';
  };

  return (
    <div data-cy="agendamento-modal" className="w-full max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in-scale p-0 h-full flex flex-col">
      <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-100/60 to-white flex items-center justify-center sticky top-0 z-10 relative rounded-t-2xl">
        <h2 className="text-2xl md:text-3xl font-extrabold text-blue-900 text-center tracking-tight drop-shadow-sm">Agendar Consulta</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
          aria-label="Fechar modal de agendamento"
        >
          <X className="h-8 w-8" />
        </button>
      </div>
      <div className="px-2 sm:px-8 py-6 flex flex-col items-center justify-center w-full flex-1 overflow-y-auto max-h-[calc(95vh-120px)]">
        {error && <div className="mb-4 flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-center text-sm font-semibold animate-fade-in"><svg className='w-5 h-5 text-red-500' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z'/></svg>{error}</div>}
        
        {step === 1 && (
          <form className="space-y-8 w-full max-w-2xl mx-auto flex flex-col flex-1 max-h-full" onSubmit={handleSubmitStep1(handleStep1Submit)}>
            <div className="flex flex-col gap-4 items-center justify-center animate-fade-in">
              <Controller
                name="slotId"
                control={controlStep1}
                render={({ field }) => (
                  <div className="w-full flex flex-col justify-center gap-8 overflow-y-auto">
                    <BookableSlotPicker
                      ref={timeSlotsRef}
                      onSelectSlot={(slot) => {
                        if (slot && slot.id !== undefined) {
                          field.onChange(slot.id.toString());
                          setSelectedSlot(slot);
                        }
                      }}
                      selectedSlot={field.value}
                      darkMode={true}
                    />
                  </div>
                )}
              />
              {typeof errorsStep1.slotId?.message === 'string' && <p className="text-red-500 text-xs mt-2 font-semibold text-center">{errorsStep1.slotId.message}</p>}
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={!selectedSlot || isLoading} className="inline-flex items-center gap-2 px-8 py-3 bg-blue-900 text-white font-bold rounded-xl shadow hover:bg-blue-800 disabled:bg-gray-400 transition-all text-lg">
                {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />Aguarde...</> : (status === 'authenticated' ? 'Confirmar Agendamento' : 'Próximo')}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-8 w-full max-w-2xl mx-auto" onSubmit={handleSubmitStep2(handleAgendar)}>
            <div className="flex flex-col gap-2 items-center mb-4">
              <span className="text-base text-gray-700 font-semibold">Confirme o dia e horário escolhidos:</span>
              <span className="text-lg text-blue-900 font-bold">{getSlotLabel()}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
              <div>
                <label htmlFor="cpf" className="block text-base font-semibold text-blue-900 mb-1">CPF</label>
                <Controller name="cpf" control={controlStep2} render={({ field }) => (
                  <input
                    {...field}
                    id="cpf"
                    type="text"
                    value={displayCpf}
                    onChange={e => {
                      const cleaned = cleanCpf(e.target.value);
                      setDisplayCpf(formatCpf(cleaned));
                      field.onChange(cleaned);
                      if (cleaned.length === 11) checkPacienteExiste(cleaned);
                    }}
                    onBlur={e => { field.onBlur(); checkPacienteExiste(cleanCpf(e.target.value)); }}
                    className="mt-1 block w-full rounded-md border-gray-400 shadow-sm text-gray-900 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500"
                    placeholder="Seu CPF"
                    maxLength={14}
                  />
                )} />
                {typeof errorsStep2.cpf?.message === 'string' && <p className="text-red-500 text-xs font-semibold mt-1">{errorsStep2.cpf.message}</p>}
              </div>
              <div>
                <label htmlFor="nomeCompleto" className="block text-base font-semibold text-blue-900 mb-1">Nome Completo</label>
                <Controller name="nomeCompleto" control={controlStep2} render={({ field }) => (
                  <input {...field} id="nomeCompleto" className="mt-1 block w-full rounded-md border-gray-400 shadow-sm text-gray-900 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500" disabled={camposBloqueados} />
                )} />
                {typeof errorsStep2.nomeCompleto?.message === 'string' && <p className="text-red-500 text-xs font-semibold mt-1">{errorsStep2.nomeCompleto.message === 'Required' ? 'O nome é obrigatório.' : errorsStep2.nomeCompleto.message}</p>}
              </div>
              <div>
                <label htmlFor="dataNascimento" className="block text-base font-semibold text-blue-900 mb-1">Data de Nascimento</label>
                <Controller name="dataNascimento" control={controlStep2} render={({ field }) => (
                  <input {...field} id="dataNascimento" type="date" className="mt-1 block w-full rounded-md border-gray-400 shadow-sm text-gray-900 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500" disabled={camposBloqueados} min="1900-01-01" max="2100-12-31" onBlur={e => {
                    const value = e.target.value;
                    if (value && (value < '1900-01-01' || value > '2100-12-31')) {
                      setValueStep2('dataNascimento', '');
                    }
                    field.onBlur();
                  }} />
                )} />
                {typeof errorsStep2.dataNascimento?.message === 'string' && <p className="text-red-500 text-xs font-semibold mt-1">{errorsStep2.dataNascimento.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-base font-semibold text-blue-900 mb-1">Email</label>
                <Controller name="email" control={controlStep2} render={({ field }) => (
                  <input {...field} id="email" type="email" className="mt-1 block w-full rounded-md border-gray-400 shadow-sm text-gray-900 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500" disabled={camposBloqueados} />
                )} />
                {typeof errorsStep2.email?.message === 'string' && <p className="text-red-500 text-xs font-semibold mt-1">{errorsStep2.email.message}</p>}
              </div>
              <div>
                <label htmlFor="telefone" className="block text-base font-semibold text-blue-900 mb-1">Telefone</label>
                <Controller name="telefone" control={controlStep2} render={({ field }) => (
                  <input
                    {...field}
                    id="telefone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    value={formatTelefone(field.value || '')}
                    onChange={e => {
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 11);
                      field.onChange(cleaned);
                    }}
                    onPaste={e => {
                      e.preventDefault();
                      const pasted = (e.clipboardData.getData('Text') || '').replace(/\D/g, '').slice(0, 11);
                      field.onChange(pasted);
                    }}
                    className="mt-1 block w-full rounded-md border-gray-400 shadow-sm text-gray-900 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500"
                    placeholder="(99) 99999-9999"
                    disabled={camposBloqueados}
                  />
                )} />
                {typeof errorsStep2.telefone?.message === 'string' && <p className="text-red-500 text-xs font-semibold mt-1">{errorsStep2.telefone.message}</p>}
              </div>
              <div>
                <label htmlFor="motivoConsulta" className="block text-base font-semibold text-blue-900 mb-1">Motivo da Consulta</label>
                <Controller name="motivoConsulta" control={controlStep2} render={({ field }) => (
                  <textarea {...field} id="motivoConsulta" className="mt-1 block w-full rounded-md border-gray-400 shadow-sm text-gray-900 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500" rows={2} placeholder="Descreva o motivo da consulta" />
                )} />
                {typeof errorsStep2.motivoConsulta?.message === 'string' && <p className="text-red-500 text-xs font-semibold mt-1">{errorsStep2.motivoConsulta.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="senha" className="block text-base font-semibold text-blue-900 mb-1">Senha</label>
                <Controller name="senha" control={controlStep2} render={({ field }) => (
                  <input
                    {...field}
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    className="mt-1 block w-full rounded-md border-gray-400 shadow-sm text-gray-900 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500"
                  />
                )} />
                {typeof errorsStep2.senha?.message === 'string' && <p className="text-red-500 text-xs font-semibold mt-1">{errorsStep2.senha.message}</p>}
                {password && (
                  <div className="mt-2">
                    {/* Password strength indicator */}
                  </div>
                )}
                {!camposBloqueados && (
                  <div>
                    <label htmlFor="confirmarSenha" className="block text-base font-semibold text-blue-900 mb-1">Confirmar Senha</label>
                    <input
                      id="confirmarSenha"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmarSenha}
                      onChange={e => {
                        setConfirmarSenha(e.target.value);
                        if (e.target.value !== password) {
                          setSenhaErro('As senhas não coincidem.');
                        } else {
                          setSenhaErro('');
                        }
                      }}
                      className="mt-1 block w-full rounded-md border-gray-400 shadow-sm text-gray-900 bg-gray-50 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-500"
                    />
                    {senhaErro && <p className="text-red-500 text-xs font-semibold mt-1">{senhaErro}</p>}
                  </div>
                )}
                <div className="flex items-center mt-2">
                  <input
                    id="mostrarSenha"
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword((v) => !v)}
                    className="mr-2"
                  />
                  <label htmlFor="mostrarSenha" className="text-sm text-gray-700 select-none cursor-pointer">Mostrar senha</label>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-8 gap-4">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow hover:bg-gray-300 transition-all text-lg">
                Voltar
              </button>
              <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 px-8 py-3 bg-blue-900 text-white font-bold rounded-xl shadow hover:bg-blue-800 disabled:bg-gray-400 transition-all text-lg">
                {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                {isLoading ? 'Aguarde...' : 'Agendar Consulta'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
