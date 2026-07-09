'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, BadgeCheck, Sparkles, Users, ShieldCheck, Clock, Star, Check, AlertCircle, Crown, Frame, Zap, Gift } from 'lucide-react';

export default function VerificacaoPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getCurrentUser();
    if (!user) { router.push('/login'); return; }

    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(p);

    const { count } = await supabase.from('follows').select('*', { count: 'exact' }).eq('following_id', user.id);
    setFollowersCount(count || 0);
    setLoading(false);
  };

  const diasDesdeCriacao = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)
    : 0;

  const requisitos = [
    { icon: Users, label: 'Mínimo de 1.000 seguidores', met: followersCount >= 1000, value: `${followersCount}/1000` },
    { icon: ShieldCheck, label: 'Conta sem restrições ativas', met: true, value: 'Ok' },
    { icon: Clock, label: 'Conta ativa há pelo menos 30 dias', met: diasDesdeCriacao >= 30, value: `${diasDesdeCriacao} dias` },
    { icon: BadgeCheck, label: 'Perfil completo com foto e bio', met: !!(profile?.avatar_url && profile?.bio && profile?.full_name), value: profile?.avatar_url && profile?.bio ? 'Completo' : 'Incompleto' },
  ];

  const todosRequisitos = requisitos.every(r => r.met);

  const beneficiosEstrela = [
    { icon: BadgeCheck, titulo: 'Selo Azul no Perfil', desc: 'Exibição do selo de verificação ao lado do seu nome.' },
    { icon: ShieldCheck, titulo: 'Maior Credibilidade', desc: 'Usuários confiam mais em perfis verificados.' },
    { icon: Zap, titulo: 'Prioridade no Suporte', desc: 'Atendimento prioritário da equipe MOVI.' },
  ];

  const beneficiosOriginal = [
    { icon: Crown, titulo: 'Moldura Exclusiva', desc: 'Moldura dourada giratória no seu avatar.' },
    { icon: Frame, titulo: 'Destaque no Explorar', desc: 'Seu perfil aparece em destaque na aba Explorar.' },
    { icon: Gift, titulo: 'Acesso Antecipado', desc: 'Teste novos recursos antes de todo mundo.' },
    { icon: BadgeCheck, titulo: 'Selo Original MOVI', desc: 'O selo mais exclusivo da plataforma.' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.push('/dashboard/configuracoes')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Selo de Verificação</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <BadgeCheck className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Selo de Verificação MOVI</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              O selo de verificação autentica contas notáveis na plataforma, ajudando a comunidade a identificar perfis oficiais.
            </p>
          </div>

          {/* Status atual */}
          <div className={`rounded-2xl p-5 ${profile?.verified ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              {profile?.verified ? (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div>
                <p className="text-gray-900 font-semibold text-sm">
                  {profile?.verified ? 'Conta Verificada' : 'Conta Não Verificada'}
                </p>
                <p className="text-gray-500 text-xs">
                  {profile?.verified ? 'Você já possui o selo de verificação.' : 'Candidate-se ao selo quando atingir os requisitos.'}
                </p>
              </div>
            </div>
          </div>

          {/* Requisitos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Requisitos para se candidatar</h3>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              {requisitos.map((req, i) => (
                <div key={i}>
                  {i > 0 && <div className="border-t border-gray-100 mx-4" />}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <req.icon className={`w-5 h-5 ${req.met ? 'text-green-500' : 'text-gray-300'}`} />
                      <p className={`text-sm ${req.met ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{req.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${req.met ? 'text-green-600' : 'text-gray-400'}`}>{req.value}</span>
                      {req.met ? <Check className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-gray-300" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tipos de selo */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tipos de Selo</h3>
            <div className="space-y-3">
              <div className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-blue-500 fill-blue-500" />
                </div>
                <div>
                  <p className="text-gray-900 text-sm font-semibold">Selo Estrela Azul</p>
                  <p className="text-gray-500 text-xs">Selo inicial concedido ao ser aprovado na verificação.</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-gray-900 text-sm font-semibold">Selo Original MOVI</p>
                  <p className="text-gray-500 text-xs">Após 1 ano com o selo Estrela, seu selo evolui automaticamente para o Original.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefícios */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Benefícios de ser verificado</h3>
            
            {/* Benefícios Estrela */}
            <div className="mb-4">
              <p className="text-xs font-medium text-blue-500 mb-2 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-blue-500" /> Selo Estrela Azul
              </p>
              <div className="space-y-2">
                {beneficiosEstrela.map((b, i) => (
                  <div key={i} className="rounded-xl bg-white border border-gray-200 p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <b.icon className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-gray-900 text-xs font-semibold">{b.titulo}</p>
                      <p className="text-gray-500 text-[11px]">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefícios Original */}
            <div>
              <p className="text-xs font-medium text-amber-500 mb-2 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" /> Selo Original MOVI
              </p>
              <div className="space-y-2">
                {beneficiosOriginal.map((b, i) => (
                  <div key={i} className="rounded-xl bg-white border border-amber-200 p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <b.icon className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-gray-900 text-xs font-semibold">{b.titulo}</p>
                      <p className="text-gray-500 text-[11px]">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botão candidatar */}
          {!profile?.verified && (
            <button
              disabled={!todosRequisitos}
              className={`w-full py-4 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                todosRequisitos
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {todosRequisitos ? 'Candidatar-se ao selo' : 'Complete os requisitos para se candidatar'}
            </button>
          )}
        </div>
      </Container>
    </div>
  );
}