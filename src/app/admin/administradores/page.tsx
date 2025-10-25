'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import { User } from '@prisma/client';
import AdminForm, { AdminFormData } from '@/components/AdminForm'; // Importação do novo componente

export default function AdministradoresPage() {
  const [admins, setAdmins] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Erro ao buscar administradores');
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const onSubmit = async (data: AdminFormData) => {
    const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users/create';
    const method = editingUser ? 'PUT' : 'POST';

    const payload: any = { ...data };
    if (!payload.password) {
      delete payload.password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar administrador');
      }

      await fetchAdmins();
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este administrador?')) {
      try {
        const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Erro ao deletar administrador');
        }
        await fetchAdmins();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestão de Administradores</h1>
        <button
          onClick={openModal}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={18} className="mr-2" />
          Novo Administrador
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ADMINISTRADOR</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100" title="Editar"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(String(user.id))} className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100" title="Deletar"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminForm
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={onSubmit}
        editingUser={editingUser}
      />
    </div>
  );
}