'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass } from 'lucide-react';

interface MobileNavProps {
  profile: any;
}

export function MobileNav({ profile }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[88%] max-w-sm">
      <nav className="bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-3xl px-2 py-2.5 shadow-2xl shadow-black/5">
        <div className="flex items-center justify-around">
          <Link href="/dashboard" className={`p-2.5 rounded-2xl transition-all ${pathname === '/dashboard' ? 'text-gray-900 bg-gray-100' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
            <Home className="w-6 h-6" strokeWidth={pathname === '/dashboard' ? 2.5 : 2} />
          </Link>
          <Link href="/explorar" className={`p-2.5 rounded-2xl transition-all ${pathname === '/explorar' ? 'text-gray-900 bg-gray-100' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
            <Compass className="w-6 h-6" strokeWidth={pathname === '/explorar' ? 2.5 : 2} />
          </Link>
          <Link href={`/${profile?.username}`} className="p-2.5 rounded-2xl">
            <div className={`w-6 h-6 rounded-full overflow-hidden ${pathname === `/${profile?.username}` ? 'ring-2 ring-gray-900' : 'ring-2 ring-gray-300'}`}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold bg-gray-100">{profile?.full_name?.charAt(0) || '?'}</div>}
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}