'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, User } from 'lucide-react';

export default function SeguidoresPage() {
  const { username } = useParams();
  const router = useRouter();
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFollowers(); }, []);

  const loadFollowers = async () => {
    const cleanUsername = decodeURIComponent(String(username)).replace('@', '');
    const { data: profile } = await supabase.from('profiles').select('id, username').eq('username', cleanUsername).single();
    
    if (profile) {
      const { data } = await supabase
        .from('follows')
        .select('follower_id, profiles:follower_id(id, username, full_name, avatar_url, verified, bio)')
        .eq('following_id', profile.id)
        .order('created_at', { ascending: false });
      setFollowers(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Seguidores</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>
          ) : followers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <User className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Nenhum seguidor ainda</p>
            </div>
          ) : (
            <div className="space-y-1">
              {followers.map((f: any) => (
                <Link key={f.follower_id} href={`/${f.profiles?.username}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {f.profiles?.avatar_url ? <img src={f.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">{f.profiles?.full_name?.charAt(0) || '?'}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{f.profiles?.full_name}</p>
                      {f.profiles?.verified && <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#0095F6"/><path d="M8.5 12L11 14.5L15.5 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <p className="text-gray-400 text-xs">@{f.profiles?.username}</p>
                    {f.profiles?.bio && <p className="text-gray-500 text-xs mt-0.5 truncate">{f.profiles.bio}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}