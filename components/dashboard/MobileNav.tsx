'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAFAFA] border-t border-gray-200">
      <div className="flex items-center justify-around py-2.5">
        <Link href="/" className={`p-2 ${pathname === '/' ? 'text-gray-900' : 'text-gray-400'}`}>
          <Home className="w-6 h-6" strokeWidth={pathname === '/' ? 2.5 : 2} />
        </Link>
        <Link href="/moments" className={`p-2 ${pathname === '/moments' ? 'text-gray-900' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={pathname === '/moments' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="16" rx="4"/><circle cx="12" cy="13" r="3"/><circle cx="18" cy="9" r="1.5"/><path d="M8 5V3h8v2"/>
          </svg>
        </Link>
        <Link href="/explorar" className={`p-2 ${pathname === '/explorar' ? 'text-gray-900' : 'text-gray-400'}`}>
          <Search className="w-6 h-6" strokeWidth={pathname === '/explorar' ? 2.5 : 2} />
        </Link>
      </div>
    </div>
  );
}