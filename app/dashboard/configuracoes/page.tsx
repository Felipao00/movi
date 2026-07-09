'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import {
  ArrowLeft, User, Mail, Calendar, Shield, ChevronRight, LogOut,
  PauseCircle, Trash2, HelpCircle, Star, Share2, FileText,
  BadgeCheck, ShieldCheck
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const user = await getCurrentUser();
    if (!user) { router.push('/login'); return; }
    setUserEmail(user.email || '');
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

  if (!profile) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
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
          {/* INFORMAÇÕES PESSOAIS */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Informações Pessoais</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              <Link href="/dashboard/perfil" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div><p className="text-gray-900 text-sm font-medium">Editar perfil</p><p className="text-gray-400 text-xs">Nome, @usuário, bio e foto</p></div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
              <div className="border-t border-gray-100 mx-4" />
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div><p className="text-gray-900 text-sm font-medium">Email</p><p className="text-gray-400 text-xs">{userEmail}</p></div>
                </div>
              </div>
              <div className="border-t border-gray-100 mx-4" />
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div><p className="text-gray-900 text-sm font-medium">Membro desde</p><p className="text-gray-400 text-xs">{profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : '—'}</p></div>
                </div>
              </div>
              <div className="border-t border-gray-100 mx-4" />
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div><p className="text-gray-900 text-sm font-medium">ID da conta</p><p className="text-gray-400 text-xs font-mono">{profile.id?.slice(0, 12)}...</p></div>
                </div>
              </div>
              <div className="border-t border-gray-100 mx-4" />
              <Link href="/dashboard/senha" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div><p className="text-gray-900 text-sm font-medium">Alterar senha</p><p className="text-gray-400 text-xs">Atualize sua senha de acesso</p></div>
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
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
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">Sem restrições</span>
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
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
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
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
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