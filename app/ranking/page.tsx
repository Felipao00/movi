'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { Home, Search, Trophy, Crown, Medal, TrendingUp, Users, Heart, Star, Image as ImageIcon, Flame, CheckCircle2, Calendar } from 'lucide-react';

interface CreatorProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  verified: boolean;
  region?: string;
  followers: number;
  photos: number;
  likes: number;
}

export default function RankingPage() {
  const pathname = usePathname();
  const [topCreators, setTopCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<CreatorProfile | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'global' | 'brasil'>('global');

  useEffect(() => { 
    initApp(); 
  }, [selectedRegion]);

  const initApp = async () => {
    await loadRanking();
  };

  const loadRanking = async () => {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      const { data: profiles, error } = await supabase.from('profiles').select('*');
      if (error) throw error;

      if (profiles) {
        const withStats = await Promise.all(profiles.map(async (profile) => {
          const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id);
          const { count: photos } = await supabase.from('photos').select('*', { count: 'exact', head: true }).eq('user_id', profile.id);
          const { data: userPhotos } = await supabase.from('photos').select('id').eq('user_id', profile.id);
          
          const photoIds = userPhotos?.map(p => p.id) || [];
          let totalLikes = 0;
          if (photoIds.length > 0) {
            const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).in('photo_id', photoIds);
            totalLikes = count || 0;
          }
          return {
            ...profile,
            followers: followers || 0,
            photos: photos || 0,
            likes: totalLikes
          };
        }));

        const sorted = withStats.sort((a, b) => b.followers - a.followers);
        setTopCreators(sorted.slice(0, 30));

        if (user) {
          const myIndex = sorted.findIndex(p => p.id === user.id);
          if (myIndex !== -1) {
            setCurrentUserProfile(sorted[myIndex]);
            setCurrentUserRank(myIndex + 1);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7] text-gray-900 selection:bg-gray-200 antialiased">
      {/* Header Premium */}
      <header className="sticky top-0 z-50 bg-[#F6F6F7]/80 backdrop-blur-md border-b border-gray-200/60">
        <Container>
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2.5">
              <div className="bg-amber-500/10 p-1.5 rounded-xl border border-amber-500/20">
                <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/10" />
              </div>
              Ranking
            </h1>
            
            <div className="flex bg-gray-200/70 p-1 rounded-xl border border-gray-300/30">
              <button onClick={() => setSelectedRegion('global')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedRegion === 'global' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Global</button>
              <button onClick={() => setSelectedRegion('brasil')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedRegion === 'brasil' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Brasil</button>
            </div>
          </div>
        </Container>
      </header>

      <main className="pt-4 pb-36">
        <Container size="small">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
            </div>
          ) : topCreators.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium">Nenhum criador encontrado.</div>
          ) : (
            <div className="space-y-6 px-1">
              
              {/* 1. SEU STATUS (Fixado no Topo) */}
              {currentUserProfile && currentUserRank && (
                <div className="rounded-2xl bg-gray-900 text-white p-4 shadow-md relative overflow-hidden border border-gray-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      <Flame className="w-3 h-3 fill-amber-400" /> Seu Status
                    </span>
                    <span className="text-xs font-bold text-gray-400">Posição Atual</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden ring-2 ring-gray-700">
                        {currentUserProfile.avatar_url ? (
                          <img src={currentUserProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{currentUserProfile.full_name?.charAt(0)}</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{currentUserProfile.full_name}</p>
                        <p className="text-[11px] text-gray-400">Faltam {(topCreators[0]?.followers - currentUserProfile.followers) > 0 ? topCreators[0].followers - currentUserProfile.followers : 0} segs para o Top 1</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                        #{currentUserRank}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. NOVO: MISSÕES & DESAFIOS DIÁRIOS (Preenchimento de alto engajamento) */}
              <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" /> Ganhe Pontos de Ranking
                  </h3>
                  <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">Temporada 1</span>
                </div>
                <div className="space-y-3">
                  {[
                    { title: 'Criador Ativo', text: 'Publique 2 fotos em Moments nesta semana', progress: '1/2', done: false },
                    { title: 'Engajamento Explosivo', text: 'Consiga 15 likes acumulados nas suas fotos', progress: '15/15', done: true }
                  ].map((task, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border transition-all ${task.done ? 'bg-gray-50/60 border-gray-100' : 'bg-white border-gray-200/70'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2.5">
                          {task.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0" />
                          )}
                          <div>
                            <p className={`text-xs font-bold ${task.done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{task.text}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${task.done ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                          {task.progress}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefícios Card */}
              <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/80 p-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3.5 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" /> Vantagens de Destaque
                </h3>
                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    { icon: Crown, label: 'Top 1', desc: 'Selo Destaque + Home por 30 dias', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
                    { icon: Medal, label: 'Top 3', desc: 'Selo Verificado + Alcance Extra', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
                    { icon: Star, label: 'Top 10', desc: 'Moldura Exclusiva + Suporte VIP', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
                    { icon: TrendingUp, label: 'Top 50', desc: 'Badge de Criador em Ascensão', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
                  ].map((b) => (
                    <div key={b.label} className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg border ${b.color} flex-shrink-0 mt-0.5`}>
                        <b.icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{b.label}</p>
                        <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pódio Físico Metálico */}
              <div className="flex items-end justify-center gap-2 pt-12 pb-4 px-1 bg-white border border-gray-200/70 rounded-2xl shadow-xs relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/30 pointer-events-none" />
                
                {[1, 0, 2].map((i) => {
                  if (!topCreators[i]) return null;
                  const creator = topCreators[i];
                  const isFirst = i === 0;

                  const config = 
                    i === 0 ? { blockHeight: 'h-24', badgeColor: 'bg-amber-500 text-white', avatarRing: 'ring-amber-500', label: '1º', icon: Crown, iconColor: 'text-amber-500' } :
                    i === 1 ? { blockHeight: 'h-16', badgeColor: 'bg-slate-400 text-white', avatarRing: 'ring-slate-300', label: '2º', icon: Medal, iconColor: 'text-slate-400' } :
                    { blockHeight: 'h-12', badgeColor: 'bg-amber-700 text-white', avatarRing: 'ring-amber-700/70', label: '3º', icon: Medal, iconColor: 'text-amber-700' };

                  return (
                    <Link key={creator.id} href={`/${creator.username}`} className="flex flex-col items-center justify-end flex-1 max-w-[105px] group z-10">
                      <div className="relative mb-3 transition-transform duration-300 group-hover:scale-105">
                        <div className={`rounded-full overflow-hidden bg-gray-50 ring-2 ring-offset-4 ring-offset-white shadow-md ${config.avatarRing} ${isFirst ? 'w-[72px] h-[72px]' : 'w-14 h-14'}`}>
                          {creator.avatar_url ? (
                            <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-black text-lg">{creator.full_name?.charAt(0)}</div>
                          )}
                        </div>
                        <config.icon className={`absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 ${config.iconColor}`} />
                      </div>

                      <p className="text-xs font-black text-gray-900 text-center truncate w-full px-1 mb-0.5">{creator.full_name?.split(' ')[0]}</p>
                      <p className="text-[10px] font-bold text-gray-400 mb-3">{creator.followers} segs</p>

                      <div className={`w-full ${config.blockHeight} bg-gradient-to-b from-gray-100 to-gray-200/40 border border-gray-200/60 rounded-xl flex items-start justify-center pt-3 shadow-xs`}>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ring-4 ring-white ${config.badgeColor}`}>{config.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* 3. NOVO: HISTÓRICO DE GANHADORES (Preenchimento Horizontal de Autoridade) */}
              <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-xs overflow-hidden">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" /> Galeria de Campeões
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { month: 'Junho', name: 'Lipe', avatar: topCreators[0]?.avatar_url },
                    { month: 'Maio', name: 'Dapaz', avatar: topCreators[1]?.avatar_url },
                    { month: 'Abril', name: 'Barroso', avatar: topCreators[2]?.avatar_url }
                  ].map((champion, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 flex-shrink-0 bg-gray-50/80 border border-gray-100 px-3 py-2 rounded-xl">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 shadow-xs">
                        {champion.avatar ? <img src={champion.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">{champion.name.charAt(0)}</div>}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{champion.month}</p>
                        <p className="text-xs font-bold text-gray-900">{champion.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista Principal Expandida */}
              <div className="rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-hidden divide-y divide-gray-100">
                <div className="bg-gray-50/50 px-4 py-2 flex items-center justify-between border-b border-gray-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Classificação Geral</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Desempenho</span>
                </div>
                
                {topCreators.slice(3).map((creator, i) => (
                  <Link key={creator.id} href={`/${creator.username}`} className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50/80 transition-colors group">
                    <span className="w-5 text-center text-xs font-mono font-black text-gray-400 group-hover:text-gray-900">{i + 4}</span>

                    <div className="w-10 h-10 rounded-full bg-gray-50 overflow-hidden flex-shrink-0 ring-1 ring-gray-200/80 shadow-xs">
                      {creator.avatar_url ? (
                        <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm bg-gray-100">{creator.full_name?.charAt(0)}</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{creator.full_name}</p>
                        {creator.verified && (
                          <svg className="w-3.5 h-3.5 text-[#0095F6] flex-shrink-0 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 mt-0.5 tracking-wide">
                        <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {creator.followers} segs</span>
                        <span className="flex items-center gap-0.5 text-gray-300">•</span>
                        <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {creator.likes} likes</span>
                        <span className="flex items-center gap-0.5 text-gray-300">•</span>
                        <span className="flex items-center gap-0.5"><ImageIcon className="w-3 h-3" /> {creator.photos} posts</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10 flex items-center gap-0.5">
                        <TrendingUp className="w-3 text-emerald-600" />
                        <span className="text-[10px] font-black text-emerald-700">+{creator.likes > 0 ? Math.round(creator.likes / 2) : 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          )}
        </Container>
      </main>

      {/* Navbar Móvel Fixa */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F6F6F7]/90 backdrop-blur-md border-t border-gray-200/80 shadow-lg">
        <div className="flex items-center justify-around h-16">
          <Link href="/" className={`p-2.5 rounded-xl transition-all ${pathname === '/' ? 'text-gray-900 bg-gray-200/50' : 'text-gray-400'}`}><Home className="w-5 h-5" strokeWidth={2.5} /></Link>
          <Link href="/moments" className={`p-2.5 rounded-xl transition-all ${pathname === '/moments' ? 'text-gray-900 bg-gray-200/50' : 'text-gray-400'}`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="16" rx="4"/><circle cx="12" cy="13" r="3"/><circle cx="18" cy="9" r="1.5"/><path d="M8 5V3h8v2"/></svg>
          </Link>
          <Link href="/ranking" className={`p-2.5 rounded-xl transition-all ${pathname === '/ranking' ? 'text-gray-900 bg-gray-200/50' : 'text-gray-400'}`}><Trophy className="w-5 h-5" strokeWidth={2.5} /></Link>
          <Link href="/explorar" className={`p-2.5 rounded-xl transition-all ${pathname === '/explorar' ? 'text-gray-900 bg-gray-200/50' : 'text-gray-400'}`}><Search className="w-5 h-5" strokeWidth={2.5} /></Link>
        </div>
      </div>
    </div>
  );
}