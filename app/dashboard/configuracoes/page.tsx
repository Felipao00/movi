'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import {
  ArrowLeft, User, Shield, ChevronRight, LogOut,
  PauseCircle, Trash2, HelpCircle, Star, Share2, FileText,
  BadgeCheck, ShieldCheck, Bell, Eye, Palette, Database, Info
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Modais de confirmação originais da "Zona de Perigo"
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  useEffect(() => {
    const load = async () => {
      setInitialLoad(true);
      await loadData();
      setInitialLoad(false);
    };
    load();
  }, []);

  const loadData = async () => {
    const user = await getCurrentUser();
    if (!user) { router.push('/login'); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETAR') return;
    const user = await getCurrentUser();
    if (!user) return;
    await supabase.from('photos').delete().eq('user_id', user.id);
    await supabase.from('follows').delete().or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);
    await supabase.from('profiles').delete().eq('id', user.id);
    router.push('/');
  };

  const handleDeactivate = async () => {
    const user = await getCurrentUser();
    if (!user) return;
    await supabase.from('profiles').update({ deactivated_at: new Date().toISOString() }).eq('id', user.id);
    await supabase.auth.signOut();
    router.push('/');
  };

  // SKELETON - Carregamento suave e instantâneo
  if (initialLoad) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
          <Container>
            <div className="flex items-center h-14">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-5 w-28 bg-gray-200 rounded-md ml-4 animate-pulse" />
            </div>
          </Container>
        </header>

        <Container size="small">
          <div className="py-6 space-y-6 animate-pulse">
            {Array.from({ length: 3 }).map((_, sectionIndex) => (
              <div key={sectionIndex}>
                <div className="h-3 w-32 bg-gray-200 rounded mb-3 px-1" />
                <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden p-4 space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  if (!profile) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-display text-gray-900 mb-2">Usuário não encontrado</h1>
        <Link href="/" className="text-gray-500 hover:text-gray-900 text-sm">Voltar</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.push(`/${profile.username}`)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Configurações</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-6">
          
          {/* CONTA E PERFIL (100% LIMPO AGORA) */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Sua Conta</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              <Link href="/dashboard/perfil" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Editar Perfil</p>
                    <p className="text-gray-400 text-xs">Nome, @usuário, bio e foto</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
              
              <div className="border-t border-gray-100 mx-4" />
              
              <Link href="/dashboard/configuracoes/dados-pessoais" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Informações Pessoais</p>
                    <p className="text-gray-400 text-xs">E-mail da conta e data de criação</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
              
              <div className="border-t border-gray-100 mx-4" />
              
              <Link href="/dashboard/senha" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Alterar Senha</p>
                    <p className="text-gray-400 text-xs">Atualize sua credencial de acesso</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            </div>
          </div>

          {/* COMO VOCÊ USA O MOVI */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Como você usa o MOVI</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              <Link href="/dashboard/configuracoes/notificacoes" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <div><p className="text-gray-900 text-sm font-medium">Notificações</p><p className="text-gray-400 text-xs">Mensagens de chat, curtidas e avisos</p></div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
              <div className="border-t border-gray-100 mx-4" />
              <Link href="/dashboard/configuracoes/privacidade" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <div><p className="text-gray-900 text-sm font-medium">Privacidade da conta</p><p className="text-gray-400 text-xs">Status online, conta privada e chat</p></div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
              <div className="border-t border-gray-100 mx-4" />
              <Link href="/dashboard/configuracoes/aparencia" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <div><p className="text-gray-900 text-sm font-medium">Aparência</p><p className="text-gray-400 text-xs">Temas e acessibilidade visual</p></div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
              <div className="border-t border-gray-100 mx-4" />
              <Link href="/dashboard/configuracoes/armazenamento" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-gray-400" />
                  <div><p className="text-gray-900 text-sm font-medium">Uso de dados e mídias</p><p className="text-gray-400 text-xs">Qualidade de upload e cache de conversas</p></div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            </div>
          </div>

          {/* PROGRAMAS */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Programas</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              <Link href="/dashboard/verificacao" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center animate-none">
                    <BadgeCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900 text-sm font-medium">Selo de Verificação</p>
                    <p className="text-gray-400 text-xs">Candidate-se ao selo azul da MOVI</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            </div>
          </div>

          {/* SEGURANÇA */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Segurança</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              <Link href="/dashboard/restricoes" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <p className="text-gray-900 text-sm font-medium">Restrições da conta</p>
                    <p className="text-gray-400 text-xs">Verifique o status da sua conta</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium animate-none">Sem restrições</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            </div>
          </div>

          {/* SOBRE */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Sobre</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              <Link href="/termos" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-gray-400" /><div><p className="text-gray-900 text-sm font-medium">Termos de uso</p></div></div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
              <div className="border-t border-gray-100 mx-4" />
              <Link href="/privacidade" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-gray-400" /><div><p className="text-gray-900 text-sm font-medium">Política de privacidade</p></div></div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
              <div className="border-t border-gray-100 mx-4" />
              <Link href="/ajuda" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><HelpCircle className="w-5 h-5 text-gray-400" /><div><p className="text-gray-900 text-sm font-medium">Central de ajuda</p></div></div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
              <div className="border-t border-gray-100 mx-4" />
              <button onClick={() => window.open('https://movi.app/rate', '_blank')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><Star className="w-5 h-5 text-gray-400" /><div className="text-left"><p className="text-gray-900 text-sm font-medium">Avaliar MOVI</p></div></div>
              </button>
              <div className="border-t border-gray-100 mx-4" />
              <button onClick={() => navigator.share?.({ title: 'MOVI', url: window.location.origin }) || alert('movi.app')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><Share2 className="w-5 h-5 text-gray-400" /><div className="text-left"><p className="text-gray-900 text-sm font-medium">Compartilhar MOVI</p></div></div>
              </button>
            </div>
          </div>

          {/* ZONA DE PERIGO */}
          <div>
            <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 px-1">Zona de Perigo</h2>
            <div className="rounded-2xl bg-white border border-red-200 overflow-hidden shadow-sm">
              <button onClick={() => setShowDeactivateConfirm(true)} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors">
                <PauseCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div className="text-left"><p className="text-red-600 text-sm font-medium">Desativar conta</p><p className="text-red-400 text-xs">Sua conta ficará oculta por até 20 dias</p></div>
              </button>
              <div className="border-t border-red-100 mx-4" />
              <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 transition-colors">
                <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="text-left"><p className="text-red-600 text-sm font-medium">Excluir conta</p><p className="text-red-400 text-xs">Permanente e irreversível</p></div>
              </button>
            </div>
          </div>

          {/* Modal Desativar */}
          {showDeactivateConfirm && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-none">
                <PauseCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <h3 className="text-gray-900 text-lg font-bold text-center mb-2">Desativar conta</h3>
                <p className="text-gray-500 text-sm text-center mb-6">Sua conta ficará oculta. Você pode reativar em até 20 dias fazendo login.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeactivateConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium">Cancelar</button>
                  <button onClick={handleDeactivate} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Desativar</button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Excluir */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-none">
                <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h3 className="text-gray-900 text-lg font-bold text-center mb-2">Excluir conta</h3>
                <p className="text-gray-500 text-sm text-center mb-4">Esta ação é permanente. Todos os dados serão perdidos.</p>
                <p className="text-gray-400 text-xs mb-3 text-center">Digite <strong>DELETAR</strong> para confirmar:</p>
                <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm mb-3 focus:outline-none focus:border-red-500" placeholder="DELETAR" />
                <div className="flex gap-3">
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium">Cancelar</button>
                  <button onClick={handleDeleteAccount} disabled={deleteInput !== 'DELETAR'} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium disabled:opacity-30">Excluir</button>
                </div>
              </div>
            </div>
          )}

          {/* Sair */}
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-white border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all">
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>

          <p className="text-center text-gray-300 text-xs">MOVI v1.0</p>
        </div>
      </Container>
    </div>
  );
}