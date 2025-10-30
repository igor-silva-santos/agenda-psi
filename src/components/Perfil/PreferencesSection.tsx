import React from 'react';
import { Bell, Shield, Eye, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreferencesSectionProps {
  register: any;
  errors: any;
  watch: any; // Adicionado
  className?: string;
}

export default function PreferencesSection({
  register,
  errors,
  watch, // Adicionado
  className 
}: PreferencesSectionProps) {

  const emailNotifications = watch('emailNotifications');
  const smsNotifications = watch('smsNotifications');
  const whatsappNotifications = watch('whatsappNotifications');

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Preferências</h3>
      </div>

      <div className="space-y-6">
        {/* Notificações */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Notificações</h4>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('emailNotifications')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Receber notificações por email</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('smsNotifications')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Receber notificações por SMS</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('whatsappNotifications')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Receber notificações por WhatsApp</span>
            </label>
          </div>
        </div>


        {/* Configurações de Conta */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4 text-gray-600" />
            <h4 className="text-md font-medium text-gray-900">Configurações de Conta</h4>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('account.twoFactorAuth')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Ativar autenticação de dois fatores</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                {...register('account.sessionTimeout')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-900">Desconectar automaticamente após inatividade</span>
            </label>
          </div>
        </div>

        {/* Idioma e Região */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-gray-600" />
            <h4 className="text-md font-medium text-gray-900">Idioma e Região</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-900 mb-2">
                Idioma
              </label>
              <select
                {...register('language')}
                id="language"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-900 mb-2">
                Fuso Horário
              </label>
              <select
                {...register('timezone')}
                id="timezone"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                <option value="America/Manaus">Manaus (GMT-4)</option>
                <option value="America/Belem">Belém (GMT-3)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 