'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, Calendar, Stethoscope, User, LogOut, ChevronDown } from 'lucide-react';

interface PortalClientLayoutProps {
  session: Session;
  children: React.ReactNode;
}

export default function PortalClientLayout({ session, children }: PortalClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fechar sidebar ao navegar (mobile)
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleRoute = () => setSidebarOpen(false);
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, [sidebarOpen]);

  const navItems = [
    { name: 'Dashboard', href: '/portal/paciente', icon: LayoutDashboard },
    { name: 'Meus Agendamentos', href: '/portal/paciente/agendamentos', icon: Calendar },
    { name: 'Minhas Recomendações', href: '/portal/paciente/recomendacoes', icon: Stethoscope },
    { name: 'Meu Perfil', href: '/portal/paciente/perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header sempre visível */}
      <header className="bg-white shadow-sm sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 justify-between">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/portal/paciente" className="font-bold text-xl text-blue-700 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Portal do Paciente
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-gray-700 font-medium">{session.user.name}</span>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400" title="Sair">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu" />
      )}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:w-64 transition-transform duration-300 ease-in-out flex flex-col`} tabIndex={sidebarOpen ? 0 : -1} aria-label="Menu lateral">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 md:hidden">
          <h2 className="text-lg font-bold text-gray-800">Menu</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Fechar menu">
            <X className="h-6 w-6" />
            </button>
          </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-base font-medium">
              <item.icon className="h-5 w-5 text-blue-400" />
                  {item.name}
                </Link>
              ))}
            </nav>
        <div className="border-t p-4 flex items-center gap-3">
          <User className="h-6 w-6 text-gray-400" />
          <span className="text-sm text-gray-700 font-medium truncate">{session.user.name}</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:ml-64">
            {children}
      </main>
    </div>
  );
}
