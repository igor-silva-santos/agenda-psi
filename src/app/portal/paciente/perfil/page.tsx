'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const perfilSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  cpf: z.string().optional(),
  image: z.string().url('URL da imagem inválida').optional(),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

export default function MeuPerfilPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/portal/perfil');
        if (response.status === 401) {
          localStorage.setItem('sessaoExpirada', 'true');
          window.location.href = '/conta/login';
          return;
        }
        if (!response.ok) throw new Error('Falha ao buscar dados');
        const data = await response.json();
        setValue('name', data.name);
        setValue('cpf', data.cpf);
        setValue('image', data.image || '');
      } catch (err: any) {
        setError('Erro ao buscar');
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [setValue]);

  const onSubmit = async (data: PerfilFormData) => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/portal/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.status === 401) {
        localStorage.setItem('sessaoExpirada', 'true');
        window.location.href = '/conta/login';
        return;
      }
      if (!response.ok) throw new Error('Falha ao atualizar perfil');
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-blue-800" data-testid="titulo-perfil">Meu Perfil</h1>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><span data-testid="loading">Carregando...</span></div>
      ) : error && !isSubmitting ? (
        <p className="text-red-500" data-testid="erro">{error}</p>
      ) : (
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="form-perfil">
            {success && <p className="text-green-600 bg-green-50 p-3 rounded text-center font-medium">{success}</p>}
            {error && isSubmitting && <p className="text-red-600 bg-red-50 p-3 rounded text-center font-medium">{error}</p>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input {...register('name')} id="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
              <input {...register('cpf')} id="cpf" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500" />
              {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>}
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">URL da Foto de Perfil</label>
              <input {...register('image')} id="image" placeholder="https://..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500" />
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:bg-gray-400">
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
