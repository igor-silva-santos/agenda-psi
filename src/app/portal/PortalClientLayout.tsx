'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Calendar, Star, User, DollarSign, LogOut, FileText } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { siteConfig } from '@/config/site';

interface PortalClientLayoutProps {
  children: React.ReactNode;
}

export default function PortalClientLayout({ children }: PortalClientLayoutProps) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Fechar sidebar ao navegar (mobile)
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  if (status === "loading") {
    return <div>Carregando...</div>; // Ou um componente de loading mais elaborado
  }

  if (!session) {
    return <div>Não autenticado</div>; // Ou redirecionar para o login
  }

  const navItems = [
    { name: 'Início', href: '/portal/paciente', icon: Home },
    { name: 'Meus Agendamentos', href: '/portal/paciente/agendamentos', icon: Calendar },
    { name: 'Recomendações', href: '/portal/paciente/recomendacoes', icon: Star },
    { name: 'Meu Perfil', href: '/portal/paciente/perfil', icon: User },
    { name: 'Financeiro', href: '/portal/paciente/financeiro', icon: DollarSign },
    { name: 'Meus Documentos', href: '/portal/paciente/meus-documentos', icon: FileText },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)} 
          aria-label="Fechar menu" 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
          <Link href="/portal/paciente" className="flex items-center gap-2">
            <img src={siteConfig.assets.logo} alt={`${siteConfig.clinicName} Logo`} className="w-12 h-12 object-contain" />
            <span className="font-bold text-xl text-gray-900 truncate">{siteConfig.clinicName}</span>
          </Link>
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(item.href) 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          ))}
        </nav>


      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <img src={siteConfig.assets.logo} alt={`${siteConfig.clinicName} Logo`} className="w-12 h-12 object-contain" />
                  <Link href="/portal/paciente">
                    <h1 className="text-lg font-semibold text-gray-900">
                      {siteConfig.clinicName}
                    </h1>
                  </Link>
                </div>
              </div>
            </div>

                        <div className="flex items-center gap-3">
                          <Link href="/portal/paciente/perfil" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                              {session.user.image ? (
                                <img src={session.user.image} alt="Foto do usuário" className="w-8 h-8 rounded-full" />
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <span className="font-semibold text-gray-900 truncate">{session.user.name}</span>
                          </Link>

                          <NotificationBell />

                          <button

                            onClick={() => signOut({ callbackUrl: '/' })}

                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"

                            title="Sair"

                          >

                            <LogOut className="h-5 w-5" />

                          </button>

                        </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
