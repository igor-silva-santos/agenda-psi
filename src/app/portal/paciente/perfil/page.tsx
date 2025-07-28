'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Save, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';
import ProfilePhotoUpload from '@/components/Perfil/ProfilePhotoUpload';
import PersonalInfoSection from '@/components/Perfil/PersonalInfoSection';
import PreferencesSection from '@/components/Perfil/PreferencesSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const perfilSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
  dataNascimento: z.string().optional(),
  address: z.string().optional(),
  image: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    whatsapp: z.boolean().default(false),
  }).default({}),
  privacy: z.object({
    profileVisible: z.boolean().default(true),
    showOnlineStatus: z.boolean().default(false),
  }).default({}),
  account: z.object({
    twoFactorAuth: z.boolean().default(false),
    sessionTimeout: z.boolean().default(true),
  }).default({}),
  language: z.string().default('pt-BR'),
  timezone: z.string().default('America/Sao_Paulo'),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}

export default function MeuPerfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
    setValue,
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      notifications: { email: true, sms: false, whatsapp: false },
      privacy: { profileVisible: true, showOnlineStatus: false },
      account: { twoFactorAuth: false, sessionTimeout: true },
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
    },
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/portal/perfil');
        if (response.status === 401) {
          setError('Sessão expirada ou não autenticado. Faça login novamente.');
          setLoading(false);
          return;
        }
        if (!response.ok) throw new Error('Falha ao buscar dados');
        const data = await response.json();
        setUserData(data);
        
        // Preencher formulário com dados do usuário
        setValue('name', data.name || '');
        setValue('email', data.email || '');
        setValue('telefone', data.telefone || '');
        setValue('cpf', data.cpf || '');
        setValue('dataNascimento', data.dataNascimento ? data.dataNascimento.split('T')[0] : '');
        setValue('address', data.address || '');
        setValue('image', data.image || '');

        // Simular atividade recente
        setRecentActivity([
          {
            id: '1',
            action: 'Login realizado',
            timestamp: new Date().toISOString(),
            details: 'Acesso ao sistema via email'
          },
          {
            id: '2',
            action: 'Perfil atualizado',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            details: 'Informações pessoais modificadas'
          },
          {
            id: '3',
            action: 'Agendamento criado',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            details: 'Nova consulta agendada'
          }
        ]);
      } catch (err: any) {
        setError('Erro ao buscar dados do perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [setValue]);

  const onSubmit = async (data: PerfilFormData) => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    
    try {
      const response = await fetch('/api/portal/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        return;
      }
      
      if (!response.ok) throw new Error('Falha ao atualizar perfil');
      
      setSuccess('Perfil atualizado com sucesso!');
      setUserData({ ...userData, ...data });
      
      // Simular nova atividade
      setRecentActivity(prev => [{
        id: Date.now().toString(),
        action: 'Perfil atualizado',
        timestamp: new Date().toISOString(),
        details: 'Informações pessoais modificadas'
      }, ...prev.slice(0, 2)]);
      
    } catch (err: any) {
      setError('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    if (diffHours > 0) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    return 'Agora mesmo';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Carregando perfil..." />
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="max-w-md mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">Gerencie suas informações pessoais e preferências</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Badge variant="info" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {userData?.role || 'Usuário'}
          </Badge>
        </div>
      </div>

      {/* Mensagens de Status */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <div className="flex items-center gap-3 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <p className="font-medium">{success}</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Foto de Perfil */}
            <Card>
              <ProfilePhotoUpload
                currentImage={userData?.image}
                onImageChange={(imageUrl) => setValue('image', imageUrl)}
              />
            </Card>

            {/* Informações Pessoais */}
            <Card>
              <PersonalInfoSection
                register={register}
                errors={errors}
                watch={watch}
              />
            </Card>

            {/* Preferências */}
            <Card>
              <PreferencesSection
                register={register}
                errors={errors}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Botão Salvar */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Save className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Salvar Alterações</h3>
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={saving}
                  disabled={!isDirty}
                  className="w-full"
                >
                  {saving ? 'Salvando...' : 'Salvar Perfil'}
                </Button>
                
                {isDirty && (
                  <p className="text-xs text-gray-500 text-center">
                    Você tem alterações não salvas
                  </p>
                )}
              </div>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Atividade Recente</h3>
                </div>
                
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.details}</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatActivityTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Estatísticas */}
            <Card>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Estatísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Membro desde</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Último login</span>
                    <span className="text-sm font-medium text-gray-900">
                      {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleDateString('pt-BR') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status da conta</span>
                    <Badge variant="success" size="sm">Ativa</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
