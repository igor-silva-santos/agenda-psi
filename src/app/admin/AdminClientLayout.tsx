'use client';

import React, { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Users,
  Shield,
  LogOut,
  Clock,
  Receipt,
  BarChart3,
  ScrollText,
} from 'lucide-react';
import clsx from 'clsx';
import NotificationBell from '@/components/NotificationBell';
import { clearDemoRoleCookie } from '@/lib/demo-auth';
import { siteConfig } from '@/config/site';

interface AdminClientLayoutProps {
  session: Session;
  children: React.ReactNode;
}

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Agendamentos', href: '/admin/agendamentos', icon: Calendar },
  { name: 'Disponibilidade', href: '/admin/disponibilidade', icon: Clock },
  { name: 'Pacientes', href: '/admin/pacientes', icon: Users },
  { name: 'Faturas', href: '/admin/faturas', icon: Receipt },
  { name: 'Relatórios', href: '/admin/relatorios', icon: BarChart3 },
  { name: 'Auditoria', href: '/admin/auditoria', icon: ScrollText },
  { name: 'Administradores', href: '/admin/administradores', icon: Shield },
];

const NavLink = ({
  item,
  onNavigate,
}: {
  item: (typeof navItems)[0];
  onNavigate?: () => void;
}) => {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== '/admin' && pathname?.startsWith(item.href));

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={clsx(
        'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors duration-200 cursor-pointer',
        isActive
          ? 'bg-brand text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      )}
    >
      <item.icon
        className={clsx(
          'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
          isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand',
        )}
      />
      {item.name}
    </Link>
  );
};

export default function AdminClientLayout({
  session,
  children,
}: AdminClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    clearDemoRoleCookie();
    await fetch('/api/demo-login', { method: 'DELETE' }).catch(() => null);
    await signOut({ redirect: false }).catch(() => null);
    router.push('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-6 border-b border-slate-100">
        <Link href="/admin" className="flex items-center gap-3 cursor-pointer">
          <img
            src={siteConfig.assets.logo}
            alt={siteConfig.productName}
            className="h-10 w-10 object-contain"
          />
          <div className="min-w-0">
            <p className="font-heading font-bold text-brand truncate">
              {siteConfig.productName}
            </p>
            <p className="text-xs text-slate-500 truncate">Painel admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            item={item}
            onNavigate={() => setSidebarOpen(false)}
          />
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
            {(session?.user?.name || 'A').charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 truncate">
              {session?.user?.name || 'Admin'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {session?.user?.email}
            </p>
          </div>
          <NotificationBell />
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex flex-col h-full border-r border-slate-200 shadow-xl">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent />
        </div>
      </div>

      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-slate-200 bg-white">
          <SidebarContent />
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="relative z-10 flex h-16 items-center gap-3 bg-white border-b border-slate-200 px-4 md:hidden">
          <button
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-heading font-semibold text-brand">
            {siteConfig.productName}
          </span>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
