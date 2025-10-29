import React from 'react';
import { User, Mail, Phone, Calendar, MapPin, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalInfoSectionProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  className?: string;
}

export default function PersonalInfoSection({ 
  register, 
  errors, 
  watch,
  setValue,
  className 
}: PersonalInfoSectionProps) {
  const watchedValues = watch();

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const onlyNumbers = value.replace(/\D/g, '');
    let formattedPhone = '';

    if (onlyNumbers.length > 0) {
      formattedPhone = `(${onlyNumbers.slice(0, 2)}`;
    }
    if (onlyNumbers.length > 2) {
      formattedPhone += `) ${onlyNumbers.slice(2, 7)}`;
    }
    if (onlyNumbers.length > 7) {
      formattedPhone += `-${onlyNumbers.slice(7, 11)}`;
    }

    setValue('telefone', formattedPhone, { shouldDirty: true });
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome Completo */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
            Nome Completo !
          </label>
          <div className="relative">
            <input
              {...register('name')}
              id="name"
              type="text"
              className={cn(
                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300',
                watchedValues.name && !errors.name && 'border-green-300 bg-green-50',
                'text-gray-900'
              )}
              placeholder="Digite seu nome completo"
            />
            {watchedValues.name && !errors.name && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('email')}
              id="email"
              type="email"
              disabled
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="seu@email.com"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
        </div>

        {/* Telefone */}
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-900 mb-2">
            Telefone !
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('telefone')}
              id="telefone"
              type="tel"
              onChange={handlePhoneChange}
              className={cn(
                'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                errors.telefone ? 'border-red-300 bg-red-50' : 'border-gray-300',
                watchedValues.telefone && !errors.telefone && 'border-green-300 bg-green-50',
                'text-gray-900'
              )}
              placeholder="(11) 99999-9999"
            />
          </div>
          {errors.telefone && (
            <p className="text-red-600 text-sm mt-1">{errors.telefone.message}</p>
          )}
        </div>

        {/* CPF */}
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-900 mb-2">
            CPF
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('cpf')}
              id="cpf"
              type="text"
              disabled
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              placeholder="000.000.000-00"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">CPF não pode ser alterado</p>
        </div>

        {/* Data de Nascimento */}
        <div>
          <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-900 mb-2">
            Data de Nascimento !
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('dataNascimento')}
              id="dataNascimento"
              type="date"
              className={cn(
                'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                errors.dataNascimento ? 'border-red-300 bg-red-50' : 'border-gray-300',
                watchedValues.dataNascimento && !errors.dataNascimento && 'border-green-300 bg-green-50',
                'text-gray-900'
              )}
            />
          </div>
          {errors.dataNascimento && (
            <p className="text-red-600 text-sm mt-1">{errors.dataNascimento.message}</p>
          )}
        </div>

        {/* Endereço */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
            Endereço !
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('address')}
              id="address"
              type="text"
              className={cn(
                'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
                errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300',
                watchedValues.address && !errors.address && 'border-green-300 bg-green-50',
                'text-gray-900'
              )}
              placeholder="Rua, número, bairro, cidade - UF"
            />
          </div>
          {errors.address && (
            <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>
      </div>
    </div>
  );
} 