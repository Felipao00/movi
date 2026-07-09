'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, User, LogOut, Camera, Settings } from 'lucide-react';

interface SidebarProps {
  profile: any;
  onLogout: () => void;
}

export function Sidebar({ profile, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', icon: Home, label: 'Início' },
    { href: '/explorar', icon: Search, label: 'Explorar' },
    { href: '/dashboard/fotos', icon: PlusSquare, label: 'Adicionar' },
    { href: `/${profile?.username}`, icon: User, label: 'Perfil' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.04] bg-[#080808] fixed h-full">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Camera className="w-8 h-8 text-white" />
        </Link>
      </div>

      {/* Links principais */}
      <nav className="px-3 flex-1 space-y-1">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? '' : ''}`} />
              <span className="text-[15px]">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Configurações */}
      <div className="px-3 pb-2">
        <Link
          href="/dashboard/perfil"
          className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm transition-all ${
            pathname === '/dashboard/perfil'
              ? 'text-white font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[15px]">Ajustes</span>
        </Link>
      </div>

      {/* Perfil embaixo */}
      <div className="px-3 pb-6">
        <button
          onClick={onLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.04] transition-all text-sm w-full"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[15px]">Sair</span>
        </button>
      </div>
    </aside>
  );
}