'use client';

import { useEffect, useState } from 'react';
type User = {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
  cpf: string | null;
  dataNascimento: Date | null;
  telefone: string | null;
  image: string | null;
  emailVerified: Date | null;
  currentSessionId: string | null;
};
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Edit, Trash2, Search, Shield, Loader2 } from 'lucide-react';

// Zod Schema para validação do formulário de admin
const adminSchema = z.object({
  
  id: z.number().optional(),
  name: z.string().min(3, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
});

type AdminFormData = z.infer<typeof adminSchema>;

// Componente Modal para o formulário (similar ao de pacientes)
const FormModal = ({ isOpen, onClose, onSubmit, editingUser, register, errors, isSubmitting }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{editingUser ? 'Editar Administrador' : 'Novo Administrador'}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
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
};

export default function AdminAdministradoresPage() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormData>({ resolver: zodResolver(adminSchema) });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users?role=ADMIN'); // Filtra por admins
      if (!response.ok) throw new Error('Falha ao buscar administradores');
      const data = await response.json();
      setAdmins(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const onSubmit = async (data: AdminFormData) => {
    const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users/create';
    const method = editingUser ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'ADMIN' }), // Garante a role
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar administrador');
      }
      fetchAdmins();
      closeModal();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser({ ...user, id: Number(user.id) });
    reset({
      ...user,
      id: Number(user.id),
      password: '',
      email: user.email ?? '',
      name: user.name ?? '',
      // Adicione outros campos que podem ser null, se necessário
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar este administrador?')) {
      try {
        await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        fetchAdmins();
      } catch (err: any) {
        alert(`Erro ao deletar: ${err.message}`);
      }
    }
  };

  const openModal = () => {
    setEditingUser(null);
    reset({ name: '', email: '', password: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const filteredAdmins = admins.filter(a => 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Administradores</h1>
            <p className="text-md text-gray-600 mt-1">Adicione ou remova usuários com permissão de administrador.</p>
          </div>
          <button onClick={openModal} className="mt-4 sm:mt-0 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold flex items-center space-x-2">
            <UserPlus size={20} />
            <span>Novo Admin</span>
          </button>
        </header>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome / E-mail</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" /></td></tr>
                ) : filteredAdmins.length > 0 ? (
                  filteredAdmins.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                            <Shield className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ADMINISTRADOR</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100" title="Editar"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100" title="Deletar"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="text-center py-10">Nenhum administrador encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <FormModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit(onSubmit)} editingUser={editingUser} register={register} errors={errors} isSubmitting={isSubmitting} />
    </div>
  );
}
