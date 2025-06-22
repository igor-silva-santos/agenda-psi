'use client';

import { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CalendarioAgendamento from './CalendarioAgendamento';

const agendamentoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  motivo: z.string().optional(),
});

type AgendamentoData = z.infer<typeof agendamentoSchema>;

interface AgendamentoFormProps {
  onClose: () => void;
}

export default function AgendamentoForm({ onClose }: AgendamentoFormProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgendamentoData>({
    resolver: zodResolver(agendamentoSchema),
  });

  const onSubmit = async (data: AgendamentoData) => {
    if (!selectedDate || !selectedTime) {
      alert('Por favor, selecione uma data e horário');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Aqui seria feita a integração com Google Calendar e WhatsApp
      const agendamento = {
        ...data,
        data: selectedDate,
        horario: selectedTime,
        timestamp: new Date().toISOString(),
      };

      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Agendamento criado:', agendamento);
      
      setIsSuccess(true);
      setStep(3);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao agendar consulta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(2);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 && 'Selecione Data e Horário'}
            {step === 2 && 'Seus Dados'}
            {step === 3 && 'Agendamento Confirmado'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Step 1: Calendário */}
        {step === 1 && (
          <div className="p-6">
            <CalendarioAgendamento onSelectDateTime={handleDateTimeSelect} />
          </div>
        )}

        {/* Step 2: Formulário */}
        {step === 2 && (
          <div className="p-6">
            {/* Resumo da seleção */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Consulta Selecionada:</h3>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedDate && formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedTime}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Nome Completo *
                </label>
                <input
                  {...register('nome')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome completo"
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  WhatsApp *
                </label>
                <input
                  {...register('telefone')}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
                {errors.telefone && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  Você receberá confirmação e lembretes por WhatsApp
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  E-mail (opcional)
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Motivo da Consulta (opcional)
                </label>
                <textarea
                  {...register('motivo')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva brevemente o que gostaria de trabalhar na terapia..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Confirmação */}
        {step === 3 && isSuccess && (
          <div className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Agendamento Confirmado!
            </h3>
            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Detalhes da sua consulta:</h4>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedDate && formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedTime}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-gray-600 mb-6">
              <p>✅ Consulta adicionada à agenda da Dra. Ana Silva</p>
              <p>✅ Confirmação enviada por WhatsApp</p>
              <p>✅ Lembrete será enviado 24h antes da consulta</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                <strong>Importante:</strong> Se precisar cancelar ou remarcar, entre em contato 
                com pelo menos 24 horas de antecedência pelo WhatsApp (11) 99999-9999.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

