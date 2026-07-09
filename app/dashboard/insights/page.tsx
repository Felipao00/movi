'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Eye, Heart, Users, TrendingUp, Calendar, BarChart3 } from 'lucide-react';

export default function InsightsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getCurrentUser();
    if (!user) { router.push('/login'); return; }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(p);

    const { count: totalPhotos } = await supabase.from('photos').select('*', { count: 'exact' }).eq('user_id', user.id);
    const { data: userPhotos } = await supabase.from('photos').select('id').eq('user_id', user.id);
    const photoIds = userPhotos?.map(p => p.id) || [];
    let totalLikes = 0;
    if (photoIds.length > 0) {
      const { count } = await supabase.from('likes').select('*', { count: 'exact' }).in('photo_id', photoIds);
      totalLikes = count || 0;
    }
    const { count: followers } = await supabase.from('follows').select('*', { count: 'exact' }).eq('following_id', user.id);

    const last6Months: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();
      const { count } = await supabase.from('photos').select('*', { count: 'exact' }).eq('user_id', user.id).gte('created_at', startOfMonth).lte('created_at', endOfMonth);
      last6Months.push({ month: date.toLocaleDateString('pt-BR', { month: 'short' }), count: count || 0 });
    }

    const bestMonth = last6Months.reduce((max, m) => m.count > max.count ? m : max, last6Months[0]);
    setStats({ totalPhotos: totalPhotos || 0, totalLikes, followers: followers || 0, last6Months, bestMonth });
    setLoading(false);
  };

  if (loading) return (<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>);

  const maxCount = Math.max(...(stats.last6Months?.map((m: any) => m.count) || [1]), 1);

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.push(`/${profile?.username}`)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Insights</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white border border-gray-200 p-5"><Eye className="w-6 h-6 text-gray-400 mb-3" /><p className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</p><p className="text-gray-500 text-xs">Publicações</p></div>
            <div className="rounded-2xl bg-white border border-gray-200 p-5"><Heart className="w-6 h-6 text-red-400 mb-3" /><p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p><p className="text-gray-500 text-xs">Curtidas</p></div>
            <div className="rounded-2xl bg-white border border-gray-200 p-5"><Users className="w-6 h-6 text-blue-400 mb-3" /><p className="text-2xl font-bold text-gray-900">{stats.followers}</p><p className="text-gray-500 text-xs">Seguidores</p></div>
            <div className="rounded-2xl bg-white border border-gray-200 p-5"><TrendingUp className="w-6 h-6 text-green-400 mb-3" /><p className="text-2xl font-bold text-gray-900">{stats.bestMonth?.count || 0}</p><p className="text-gray-500 text-xs">Melhor mês</p></div>
          </div>

          {/* Gráfico de barras */}
          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" />Publicações por mês</h3>
            <div className="flex items-end gap-3 h-40 px-2">
              {stats.last6Months?.map((m: any) => {
                const height = maxCount > 0 ? (m.count / maxCount) * 100 : 0;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className={`text-xs font-bold ${m.count === maxCount ? 'text-purple-700' : 'text-gray-400'}`}>{m.count}</span>
                    <div 
                      className="w-full rounded-t-lg transition-all duration-500"
                      style={{ 
                        height: `${Math.max(height, 4)}%`,
                        background: m.count === maxCount 
                          ? 'linear-gradient(180deg, #7C3AED, #A78BFA)' 
                          : 'linear-gradient(180deg, #E9D5FF, #DDD6FE)'
                      }}
                    />
                    <span className="text-[10px] text-gray-400">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo */}
          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" />Resumo</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Total de publicações</span><span className="text-gray-900 font-medium">{stats.totalPhotos}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total de curtidas</span><span className="text-gray-900 font-medium">{stats.totalLikes}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Seguidores</span><span className="text-gray-900 font-medium">{stats.followers}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Mês com mais publis</span><span className="text-gray-900 font-medium">{stats.bestMonth?.month} ({stats.bestMonth?.count})</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Média de curtidas por publi</span><span className="text-gray-900 font-medium">{stats.totalPhotos > 0 ? Math.round(stats.totalLikes / stats.totalPhotos) : 0}</span></div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}