import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Edit, Trash2, PlusCircle, Loader2, Save, XCircle, KeyRound } from 'lucide-react';

interface AppUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'PACIENTE' });
  const [editFormData, setEditFormData] = useState({ name: '', email: '', password: '', role: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data: AppUser[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }
      setNewUser({ name: '', email: '', password: '', role: 'PACIENTE' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      setEditingUserId(null);
      setEditFormData({ name: '', email: '', password: '', role: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEditing = (user: AppUser) => {
    setEditingUserId(user.id);
    setEditFormData({ name: user.name || '', email: user.email, password: '', role: user.role });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h2>

      {error && <p className="text-red-500 p-4 bg-red-100 rounded-md">Erro: {error}</p>}

      {/* Adicionar Novo Usuário */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Adicionar Novo Usuário</h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label htmlFor="newName" className="block text-sm font-medium text-gray-700">Nome:</label>
            <input
              id="newName"
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              id="newEmail"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Senha:</label>
            <input
              id="newPassword"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="newRole" className="block text-sm font-medium text-gray-700">Função:</label>
            <select
              id="newRole"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="PACIENTE">PACIENTE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
            Adicionar Usuário
          </button>
        </form>
      </section>

      {/* Lista de Usuários */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Usuários Existentes</h3>
        {loading ? (
          <div className="flex justify-center items-center min-h-[120px]"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
        ) : users.length === 0 ? (
          <p className="text-gray-600">Nenhum usuário encontrado.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="py-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate"><Mail className="inline-block h-4 w-4 mr-1" />{user.email}</p>
                  <p className="text-sm text-gray-500"><User className="inline-block h-4 w-4 mr-1" />{user.role}</p>
                </div>
                <div className="ml-4 flex-shrink-0 space-x-2">
                  {editingUserId === user.id ? (
                    <form onSubmit={handleEditUser} className="space-y-2">
                      <div>
                        <label htmlFor="editName" className="sr-only">Nome</label>
                        <input
                          id="editName"
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                          placeholder="Nome"
                        />
                      </div>
                      <div>
                        <label htmlFor="editEmail" className="sr-only">Email</label>
                        <input
                          id="editEmail"
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                          placeholder="Email"
                        />
                      </div>
                      <div>
                        <label htmlFor="editPassword" className="sr-only">Nova Senha (opcional)</label>
                        <input
                          id="editPassword"
                          type="password"
                          value={editFormData.password}
                          onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                          placeholder="Nova Senha (opcional)"
                        />
                      </div>
                      <div>
                        <label htmlFor="editRole" className="sr-only">Função</label>
                        <select
                          id="editRole"
                          value={editFormData.role}
                          onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        >
                          <option value="PACIENTE">PACIENTE</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Save className="h-4 w-4 mr-1" /> Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(user)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-2"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Deletar
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
