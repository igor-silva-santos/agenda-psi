"use client";
import CombinedLoginForm from '@/components/CombinedLoginForm';
import { useEffect, useState } from 'react';

export default function ContaLoginPage() {
  const [sessaoExpirada, setSessaoExpirada] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('sessaoExpirada')) {
      setSessaoExpirada(true);
      localStorage.removeItem('sessaoExpirada');
    }
  }, []);
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">Acesse sua Conta</h1>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="p-8 bg-white rounded-xl shadow-md w-full max-w-md m-4">
          {sessaoExpirada && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-center text-sm font-medium">
              Sua sessão expirou. Faça login novamente.
            </div>
          )}
          <CombinedLoginForm onOpenSignUp={() => {}} />
        </div>
      </main>
      <footer className="bg-white mt-8 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Dra. Jandira Frederick. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
} 