'use client'

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { User } from '@prisma/client';

const adminSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
});

export type AdminFormData = z.infer<typeof adminSchema>;

interface AdminFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdminFormData) => void;
  editingUser: User | null;
}

export default function AdminForm({ isOpen, onClose, onSubmit, editingUser }: AdminFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        ...editingUser,
        password: '',
        email: editingUser.email ?? '',
        name: editingUser.name ?? '',
      });
    } else {
      reset({ name: '', email: '', password: '' });
    }
  }, [editingUser, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{editingUser ? 'Editar Administrador' : 'Novo Administrador'}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('id')} />
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input {...register('name')} id="name" className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input {...register('email')} id="email" type="email" className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
           <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha {editingUser && '(Deixe em branco para não alterar)'}</label>
            <input {...register('password')} id="password" type="password" className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold">
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
