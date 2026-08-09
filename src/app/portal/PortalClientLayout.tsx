'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  Calendar,
  Star,
  User,
  DollarSign,
  LogOut,
  FileText,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { siteConfig } from '@/config/site';
import {
  clearDemoRoleCookie,
  demoUsers,
  readDemoRoleFromDocument,
} from '@/lib/demo-auth';

interface PortalClientLayoutProps {
  children: React.ReactNode;
}

export default function PortalClientLayout({
  children,
}: PortalClientLayoutProps) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [demoUser, setDemoUser] = useState<(typeof demoUsers)['PACIENTE'] | null>(
    null,
  );
  const [demoReady, setDemoReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const role = readDemoRoleFromDocument();
    if (role === 'PACIENTE' || role === 'ADMIN') {
      setDemoUser(demoUsers.PACIENTE);
    }
    setDemoReady(true);
  }, []);

  const user = session?.user || demoUser;

  if ((!demoReady && status === 'loading') || (status === 'loading' && !demoUser && !demoReady)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-slate-600">
        Carregando portal…
      </div>
    );
  }

  if (demoReady && !user && status !== 'authenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
        <p className="text-slate-600">Sessão de demonstração necessária.</p>
        <Link
          href="/conta/login"
          className="px-4 py-2 bg-brand text-white rounded-xl cursor-pointer"
        >
          Ir para login
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-slate-600">
        Carregando portal…
      </div>
    );
  }

  const displayName = user.name || 'Paciente';
  const displayImage = user.image || null;

  const navItems = [
    { name: 'Início', href: '/portal/paciente', icon: Home },
    { name: 'Meus Agendamentos', href: '/portal/paciente/agendamentos', icon: Calendar },
    { name: 'Recomendações', href: '/portal/paciente/recomendacoes', icon: Star },
    { name: 'Meu Perfil', href: '/portal/paciente/perfil', icon: User },
    { name: 'Financeiro', href: '/portal/paciente/financeiro', icon: DollarSign },
    { name: 'Meus Documentos', href: '/portal/paciente/meus-documentos', icon: FileText },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    clearDemoRoleCookie();
    await fetch('/api/demo-login', { method: 'DELETE' }).catch(() => null);
    await signOut({ redirect: false }).catch(() => null);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}
      >
        <div className="flex items-center justify-between px-5 py-6 border-b border-slate-100">
          <Link
            href="/portal/paciente"
            className="flex items-center gap-3 min-w-0 cursor-pointer"
          >
            <img
              src={siteConfig.assets.logo}
              alt={siteConfig.productName}
              className="w-10 h-10 object-contain"
            />
            <div className="min-w-0">
              <span className="font-heading font-bold text-brand block truncate">
                {siteConfig.productName}
              </span>
              <span className="text-xs text-slate-500">Portal do paciente</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${
                  isActive(item.href)
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <item.icon
                className={`h-5 w-5 ${
                  isActive(item.href) ? 'text-white' : 'text-slate-400'
                }`}
              />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 lg:hidden">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-slate-600 hover:text-red-600 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                onClick={() => setSidebarOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-heading font-semibold text-slate-900 hidden sm:block">
                Olá, {displayName.split(' ')[0]}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/portal/paciente/perfil"
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="font-medium text-slate-800 truncate max-w-[120px] hidden sm:inline">
                  {displayName}
                </span>
              </Link>

              <NotificationBell />

              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
