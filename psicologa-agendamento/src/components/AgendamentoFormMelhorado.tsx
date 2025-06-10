'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CalendarioAgendamento from './CalendarioAgendamento';

const agendamentoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  motivo: z.string().min(10, 'Descreva brevemente o motivo da consulta (mínimo 10 caracteres)'),
});

type AgendamentoForm = z.infer<typeof agendamentoSchema>;

interface AgendamentoFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgendamentoForm({ isOpen, onClose }: AgendamentoFormProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AgendamentoForm>({
    resolver: zodResolver(agendamentoSchema),
  });

  const resetForm = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setIsSubmitting(false);
    setShowSuccess(false);
    reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (data: AgendamentoForm) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/agendamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          data: selectedDate,
          horario: selectedTime,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        throw new Error('Erro ao agendar consulta');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao agendar consulta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center">
              <Calendar className="h-6 w-6 mr-3" />
              Agendar Consulta
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-4 flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-white' : 'text-emerald-200'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= 1 ? 'bg-white text-emerald-600' : 'bg-emerald-500'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Data e Horário</span>
            </div>
            <div className={`w-8 h-1 rounded transition-all ${step >= 2 ? 'bg-white' : 'bg-emerald-400'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-white' : 'text-emerald-200'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= 2 ? 'bg-white text-emerald-600' : 'bg-emerald-500'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Seus Dados</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                Escolha a data e horário da sua consulta
              </h3>
              <CalendarioAgendamento onSelect={handleDateTimeSelect} />
            </div>
          )}

          {step === 2 && !showSuccess && (
            <div>
              <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                  Consulta selecionada:
                </h3>
                <div className="flex items-center space-x-4 text-gray-700">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                    <span className="font-medium">{new Date(selectedDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2 text-emerald-600" />
                      Nome completo *
                    </label>
                    <input
                      {...register('nome')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Seu nome completo"
                    />
                    {errors.nome && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.nome.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2 text-emerald-600" />
                      WhatsApp *
                    </label>
                    <input
                      {...register('telefone')}
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="(11) 99999-9999"
                    />
                    {errors.telefone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.telefone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2 text-emerald-600" />
                    Email (opcional)
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="h-4 w-4 inline mr-2 text-emerald-600" />
                    Motivo da consulta *
                  </label>
                  <textarea
                    {...register('motivo')}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    placeholder="Descreva brevemente o que gostaria de trabalhar na consulta..."
                  />
                  {errors.motivo && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.motivo.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Agendando...
                      </>
                    ) : (
                      'Confirmar Agendamento'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {showSuccess && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Consulta Agendada com Sucesso!
              </h3>
              <p className="text-gray-600 mb-4">
                Você receberá uma confirmação via WhatsApp em breve.
              </p>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <p className="text-sm text-gray-700">
                  <strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')} às {selectedTime}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Em caso de cancelamento, avise com 24h de antecedência.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

