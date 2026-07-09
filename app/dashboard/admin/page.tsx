'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Shield, Search, BadgeCheck } from 'lucide-react';

// Lista de IDs master (só esses acessam)
const MASTER_IDS = ['seu-id-aqui']; // Troque pelo seu ID

export default function AdminMasterPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isMaster, setIsMaster] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { checkAccess(); }, []);

  const checkAccess = async () => {
    const user = await getCurrentUser();
    if (!user || !MASTER_IDS.includes(user.id)) {
      router.push('/dashboard');
      return;
    }
    setIsMaster(true);
    loadUsers();
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
  };

  const toggleVerify = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await supabase.from('profiles').update({ 
      verified: newStatus,
      verified_at: newStatus ? new Date().toISOString() : null 
    }).eq('id', userId);
    setMessage(newStatus ? '✅ Usuário verificado!' : '❌ Verificação removida');
    setTimeout(() => setMessage(''), 2000);
    loadUsers();
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isMaster) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 ml-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <h1 className="text-base font-semibold text-gray-900">Painel Master</h1>
            </div>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6">
          {message && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-sm text-center">{message}</div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar usuário..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-gray-900"
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-gray-900 text-sm font-medium">{user.full_name}</p>
                      {user.verified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleVerify(user.id, user.verified)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    user.verified
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {user.verified ? 'Remover selo' : 'Verificar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}