'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Search, ArrowLeft, Home, Compass, User } from 'lucide-react';

export default function ExplorarPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUsers();
    checkUser();
  }, []);

  const checkUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(data);
    }
  };

  const loadUsers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50);
    const { data: photos } = await supabase.from('photos').select('user_id');
    const usersWithCount = profiles?.map(profile => ({
      ...profile,
      photoCount: photos?.filter(p => p.user_id === profile.id).length || 0,
    })) || [];
    setUsers(usersWithCount);
    setLoading(false);
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <Container>
          <div className="flex items-center gap-3 h-14">
            <Link href="/" className="p-2 -ml-2 text-text-secondary hover:text-text-primary">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar fotógrafos..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent/30"
              />
            </div>
          </div>
        </Container>
      </header>

      <main className="pt-4 pb-24">
        <Container>
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/${user.username}`}
                  className="p-4 rounded-2xl bg-surface border border-border hover:shadow-md transition-all text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-surface border-2 border-border mx-auto mb-3 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-xl font-bold">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <p className="text-text-primary font-medium text-sm truncate">{user.full_name}</p>
                  <p className="text-text-muted text-xs">@{user.username}</p>
                  <p className="text-text-muted text-xs mt-1">{user.photoCount} foto{user.photoCount !== 1 ? 's' : ''}</p>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </main>

      {/* Navbar mobile */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[88%] max-w-sm">
        <nav className="bg-white/90 backdrop-blur-2xl border border-gray-200/50 rounded-3xl px-2 py-2.5 shadow-2xl shadow-black/5">
          <div className="flex items-center justify-around">
            <Link href="/" className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all">
              <Home className="w-6 h-6" strokeWidth={2} />
            </Link>
            <Link href="/explorar" className="p-2.5 rounded-2xl text-gray-900 bg-gray-100">
              <Compass className="w-6 h-6" strokeWidth={2.5} />
            </Link>
            {currentUser && userProfile ? (
              <Link href={`/${userProfile.username}`} className="p-2.5 rounded-2xl">
                <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-gray-300">
                  {userProfile.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] font-bold bg-gray-100">
                      {userProfile.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <Link href="/login" className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all">
                <User className="w-6 h-6" strokeWidth={2} />
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}