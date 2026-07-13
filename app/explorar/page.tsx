'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Search, ArrowLeft, Home, X, Users } from 'lucide-react';

export default function ExplorarPage() {
  const pathname = usePathname();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    await getCurrentUser();
  };

  const handleSearch = async (value: string) => {
    setSearch(value);
    if (value.trim().length < 2) { setUsers([]); setHasSearched(false); return; }
    setLoading(true); setHasSearched(true);
    const { data: profiles } = await supabase.from('profiles').select('*').or(`username.ilike.%${value}%,full_name.ilike.%${value}%`).order('created_at', { ascending: false }).limit(20);
    setUsers(profiles || []); setLoading(false);
  };

  const clearSearch = () => { setSearch(''); setUsers([]); setHasSearched(false); inputRef.current?.focus(); };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center gap-3 h-14">
            <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input ref={inputRef} type="text" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:border-gray-400 transition-all" autoFocus />
              {search && <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}
            </div>
          </div>
        </Container>
      </header>

      <main className="pt-4 pb-20">
        <Container>
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400"><div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4"><Users className="w-10 h-10 opacity-30" /></div><p className="text-base font-medium text-gray-500">Faça uma pesquisa</p><p className="text-sm mt-1">Encontre perfis pelo nome ou @usuário</p></div>
          ) : loading ? (
            <div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-400"><Search className="w-12 h-12 mb-3 opacity-30" /><p className="text-base font-medium text-gray-500">Nenhum resultado</p><p className="text-sm mt-1">Ninguém encontrado para "{search}"</p></div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 px-1 mb-2">{users.length} resultado{users.length !== 1 ? 's' : ''} para "{search}"</p>
              {users.map((user) => (
                <Link key={user.id} href={`/${user.username}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">{user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">{user.full_name?.charAt(0) || '?'}</div>}</div>
                  <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><p className="text-gray-900 text-sm font-semibold truncate">{user.full_name}</p>{user.verified && <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#0095F6"/><path d="M8.5 12L11 14.5L15.5 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div><p className="text-gray-400 text-xs">@{user.username}</p></div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAFAFA] border-t border-gray-200">
        <div className="flex items-center justify-around py-2.5">
          <Link href="/" className={`p-2 ${pathname === '/' ? 'text-gray-900' : 'text-gray-400'}`}><Home className="w-6 h-6" strokeWidth={pathname === '/' ? 2.5 : 2} /></Link>
          <Link href="/moments" className={`p-2 ${pathname === '/moments' ? 'text-gray-900' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={pathname === '/moments' ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="16" rx="4"/><circle cx="12" cy="13" r="3"/><circle cx="18" cy="9" r="1.5"/><path d="M8 5V3h8v2"/></svg>
          </Link>
          <Link href="/explorar" className={`p-2 ${pathname === '/explorar' ? 'text-gray-900' : 'text-gray-400'}`}><Search className="w-6 h-6" strokeWidth={pathname === '/explorar' ? 2.5 : 2} /></Link>
        </div>
      </div>
    </div>
  );
}