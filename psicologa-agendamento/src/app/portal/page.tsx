'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Loader2 } from 'lucide-react';

export default function PortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null; // Correção: A variável `null` não era usada, mas o retorno dela é válido.
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Portal do Paciente</h1>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Bem-vindo(a), {session?.user?.name || 'Paciente'}!
          </h2>
          <p className="text-gray-600">
            Este é o seu espaço seguro para gerenciar suas consultas e acompanhar sua jornada terapêutica.
          </p>
          {/* Futuras funcionalidades aqui */}
        </div>
      </main>
    </div>
  );
}