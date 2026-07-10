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
  const [topPhotos, setTopPhotos] = useState<any[]>([]);
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

    const { data: allPhotos } = await supabase.from('photos').select('id, title, image_url').eq('user_id', user.id);
    const photosWithLikes = await Promise.all((allPhotos || []).map(async (photo) => {
      const { count } = await supabase.from('likes').select('*', { count: 'exact' }).eq('photo_id', photo.id);
      return { ...photo, likes: count || 0 };
    }));
    const sorted = photosWithLikes.sort((a, b) => b.likes - a.likes).slice(0, 3);
    setTopPhotos(sorted);

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
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white border border-gray-200 p-5"><Eye className="w-6 h-6 text-gray-400 mb-3" /><p className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</p><p className="text-gray-500 text-xs">Publicações</p></div>
            <div className="rounded-2xl bg-white border border-gray-200 p-5"><Heart className="w-6 h-6 text-red-400 mb-3" /><p className="text-2xl font-bold text-gray-900">{stats.totalLikes}</p><p className="text-gray-500 text-xs">Curtidas</p></div>
            <div className="rounded-2xl bg-white border border-gray-200 p-5"><Users className="w-6 h-6 text-blue-400 mb-3" /><p className="text-2xl font-bold text-gray-900">{stats.followers}</p><p className="text-gray-500 text-xs">Seguidores</p></div>
            <div className="rounded-2xl bg-white border border-gray-200 p-5"><TrendingUp className="w-6 h-6 text-green-400 mb-3" /><p className="text-2xl font-bold text-gray-900">{stats.bestMonth?.count || 0}</p><p className="text-gray-500 text-xs">Melhor mês</p></div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" />Publicações por mês</h3>
            <div className="flex items-end gap-3 h-40 px-2">
              {stats.last6Months?.map((m: any) => {
                const height = maxCount > 0 ? (m.count / maxCount) * 100 : 0;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className={`text-xs font-bold ${m.count === maxCount ? 'text-purple-700' : 'text-gray-400'}`}>{m.count}</span>
                    <div className="w-full rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(height, 4)}%`, background: m.count === maxCount ? 'linear-gradient(180deg, #7C3AED, #A78BFA)' : 'linear-gradient(180deg, #E9D5FF, #DDD6FE)' }} />
                    <span className="text-[10px] text-gray-400">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 3 - Efeito Profundidade */}
          {topPhotos.length > 0 && (
            <div className="rounded-2xl bg-white border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400 fill-red-400" /> Mais curtidas
              </h3>
              <div className="flex items-center justify-center gap-3">
                {topPhotos[1] && (
                  <div className="flex-1 relative">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 opacity-50 blur-[2px] scale-90">
                      {topPhotos[1].image_url ? <img src={topPhotos[1].image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-900 flex items-center justify-center p-2"><p className="text-white text-[9px] text-center">{topPhotos[1].title}</p></div>}
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                      <span className="text-white text-[10px] font-medium">{topPhotos[1].likes}</span>
                    </div>
                  </div>
                )}
                
                {topPhotos[0] && (
                  <div className="flex-[1.2] relative z-10">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-2xl">
                      {topPhotos[0].image_url ? <img src={topPhotos[0].image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-900 flex items-center justify-center p-3"><p className="text-white text-xs text-center">{topPhotos[0].title}</p></div>}
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                      <span className="text-white text-[10px] font-medium">{topPhotos[0].likes}</span>
                    </div>
                  </div>
                )}

                {topPhotos[2] && (
                  <div className="flex-1 relative">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 opacity-50 blur-[2px] scale-90">
                      {topPhotos[2].image_url ? <img src={topPhotos[2].image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-900 flex items-center justify-center p-2"><p className="text-white text-[9px] text-center">{topPhotos[2].title}</p></div>}
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                      <span className="text-white text-[10px] font-medium">{topPhotos[2].likes}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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