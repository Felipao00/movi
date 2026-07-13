'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Home, Search, Heart, MessageCircle, Repeat2, Share, Bell, Sparkles } from 'lucide-react';

const categories = ['Todos', 'Inspirador', 'Relevantes', 'Humor', 'Natureza', 'Arte'];

export default function MomentsPage() {
  const pathname = usePathname();
  const [moments, setMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { initApp(); }, []);

  const initApp = async () => { await checkUser(); await loadMoments(); };

  const checkUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);
      const { count } = await supabase.from('notifications').select('*', { count: 'exact' }).eq('user_id', user.id).eq('read', false);
      setUnreadCount(count || 0);
    }
  };

  const loadMoments = async () => {
    const { data } = await supabase.from('photos').select(`id, title, image_url, created_at, user_id, profiles:user_id (id, username, full_name, avatar_url, verified)`).order('created_at', { ascending: false }).limit(40);
    setMoments(data || []); setLoading(false);
  };

  const timeAgo = (date: string) => { const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000); if (diff < 60) return `${diff}s`; if (diff < 3600) return `${Math.floor(diff / 60)}min`; if (diff < 86400) return `${Math.floor(diff / 3600)}h`; return `${Math.floor(diff / 86400)}d`; };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="fixed top-0 left-0 right-0 z-20 bg-[#FAFAFA] border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between h-14">
            <h1 className="text-2xl font-bold tracking-tight"><span className="text-gray-900">Mo</span><span className="text-purple-500">vi+</span></h1>
            <div className="flex items-center gap-1">
              <Link href="/notificacoes" className="p-2 text-gray-500 hover:text-gray-900 relative">
                <Bell className="w-6 h-6" strokeWidth={2} />
                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>
              {userProfile && (
                <Link href={`/${userProfile.username}`} className="p-1.5 ml-1"><div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200">{userProfile.avatar_url ? <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">{userProfile.full_name?.charAt(0) || '?'}</div>}</div></Link>
              )}
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>{cat}</button>
            ))}
          </div>
        </Container>
      </header>

      <main className="pt-28 pb-16">
        <Container size="small">
          {loading ? (<div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>) : moments.length === 0 ? (<div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400"><Sparkles className="w-12 h-12 mb-3 opacity-30" /><p className="text-base font-medium text-gray-500">Nenhum moment ainda</p></div>) : (
            <div className="divide-y divide-gray-100">
              {moments.map((moment) => (
                <div key={moment.id} className="py-4">
                  <div className="flex gap-3">
                    <Link href={`/${moment.profiles?.username}`} className="flex-shrink-0"><div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">{moment.profiles?.avatar_url ? <img src={moment.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">{moment.profiles?.full_name?.charAt(0) || '?'}</div>}</div></Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Link href={`/${moment.profiles?.username}`} className="flex items-center gap-1.5 hover:underline"><span className="text-sm font-bold text-gray-900 truncate">{moment.profiles?.full_name}</span>{moment.profiles?.verified && <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#0095F6"/><path d="M8.5 12L11 14.5L15.5 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</Link>
                        <span className="text-gray-400 text-sm">@{moment.profiles?.username}</span><span className="text-gray-400 text-sm">·</span><span className="text-gray-400 text-sm">{timeAgo(moment.created_at)}</span>
                      </div>
                      {moment.title && <p className="text-[15px] text-gray-900 leading-relaxed mb-3 whitespace-pre-line">{moment.title}</p>}
                      {moment.image_url && <div className="rounded-2xl overflow-hidden border border-gray-200 mb-3"><img src={moment.image_url} alt="" className="w-full max-h-96 object-cover" loading="lazy" /></div>}
                      <div className="flex items-center gap-6 mt-1">
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors group"><div className="p-1.5 rounded-full group-hover:bg-blue-50"><MessageCircle className="w-4 h-4" /></div><span className="text-xs">0</span></button>
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-green-500 transition-colors group"><div className="p-1.5 rounded-full group-hover:bg-green-50"><Repeat2 className="w-4 h-4" /></div><span className="text-xs">0</span></button>
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors group"><div className="p-1.5 rounded-full group-hover:bg-red-50"><Heart className="w-4 h-4" /></div><span className="text-xs">0</span></button>
                        <button className="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors ml-auto"><div className="p-1.5 rounded-full hover:bg-blue-50"><Share className="w-4 h-4" /></div></button>
                      </div>
                    </div>
                  </div>
                </div>
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