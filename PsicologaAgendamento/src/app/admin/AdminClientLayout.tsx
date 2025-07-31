'use client';

import React from 'react';
import { useState } from 'react';
import { Session } from 'next-auth';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, LayoutDashboard, Calendar, Users, Shield, LogOut, Clock, Heart } from 'lucide-react';
import clsx from 'clsx';

interface AdminClientLayoutProps {
  session: Session;
  children: React.ReactNode;
}

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Agendamentos', href: '/admin/agendamentos', icon: Calendar },
  { name: 'Disponibilidade', href: '/admin/disponibilidade', icon: Clock },
  { name: 'Pacientes', href: '/admin/pacientes', icon: Users },
  { name: 'Administradores', href: '/admin/administradores', icon: Shield },
];

const NavLink = ({ item }: { item: typeof navItems[0] }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={clsx(
        'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <item.icon 
        className={clsx(
            'mr-3 flex-shrink-0 h-5 w-5 transition-colors',
            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
        )} 
      />
      {item.name}
    </Link>
  );
};

export default function AdminClientLayout({ session, children }: AdminClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Image
                src={session?.user?.image || '/default-avatar.png'}
                alt="Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {session?.user?.name || 'Admin'}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/conta/login' })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sair
          </button>
        </div>
        <nav className="mt-8 flex-1 px-3 space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Enter' && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Fechar sidebar"
        ></div>
      )}
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 flex z-40 md:hidden transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button onClick={() => setSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm md:hidden">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {children}
        </main>
      </div>
    </div>
  );
}