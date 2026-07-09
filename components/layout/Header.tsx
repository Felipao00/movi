'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Início', href: '/' },
  { label: 'Sobre', href: '/about' },
];

function SiteLogo({ logoUrl }: { logoUrl?: string }) {
  if (logoUrl) {
    return (
      <div className="w-[22px] h-[22px] rounded-full overflow-hidden border border-white/[0.1] flex-shrink-0">
        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <motion.g initial={{ rotate: -30, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }} style={{ transformOrigin: 'center' }}>
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse key={angle} cx="14" cy="9" rx="2.5" ry="6" fill="currentColor" opacity="0.8" transform={`rotate(${angle} 14 14)`} />
        ))}
        <circle cx="14" cy="14" r="2.5" fill="currentColor" opacity="0.9" />
      </motion.g>
    </svg>
  );
}

export function Header({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
        className="relative bg-white/[0.02] backdrop-blur-2xl border border-white/[0.06] rounded-2xl px-5 py-2.5 shadow-2xl shadow-black/20 max-w-2xl mx-auto overflow-hidden"
      >
        {/* Efeito de luz correndo na borda */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-shimmer" 
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }} 
          />
        </div>

        <div className="relative flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="text-text-primary group-hover:text-text-secondary transition-colors duration-500">
              <SiteLogo logoUrl={logoUrl} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-text-primary font-display text-base tracking-tight">Lipe</span>
              <span className="text-text-muted font-body text-[9px] uppercase tracking-[0.2em]">Photos</span>
            </div>
          </Link>

          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`relative px-3 py-1.5 text-xs font-body tracking-wide transition-colors duration-300 rounded-full ${
                      isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span layoutId="nav-indicator" className="absolute inset-0 bg-white/[0.05] rounded-full -z-10" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.nav>
    </header>
  );
}