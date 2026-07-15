'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Bell, Heart, UserPlus, Sparkles, Clock, Check, X } from 'lucide-react';

export default function NotificacoesPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    const user = await getCurrentUser();
    if (!user) { router.push('/login'); return; }

    const { data } = await supabase
      .from('notifications')
      .select('*, from_user:from_user_id(username, full_name, avatar_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setNotifications(data || []);
    setLoading(false);

    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
  };

  // Aceitar solicitação de conexão
  const handleAcceptRequest = async (e: React.MouseEvent, notification: any) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      console.log("Tentando aceitar solicitação de seguir...", {
        follower_id: notification.from_user_id,
        following_id: notification.user_id
      });

      // 1. Atualiza o status na tabela follows para aprovado
      const { error: followError } = await supabase
        .from('follows')
        .update({ status: 'aprovado' })
        .eq('follower_id', notification.from_user_id)
        .eq('following_id', notification.user_id);

      if (followError) {
        console.error("Erro ao atualizar status na tabela 'follows':", followError);
        alert(`Erro na tabela follows: ${followError.message}`);
        throw followError;
      }

      console.log("Tabela 'follows' atualizada com sucesso! Atualizando notificação...");

      // 2. Transforma a notificação em um follow normal na interface/banco
      const { error: notificationError } = await supabase
        .from('notifications')
        .update({ type: 'follow' })
        .eq('id', notification.id);

      if (notificationError) {
        console.error("Erro ao atualizar tipo na tabela 'notifications':", notificationError);
        alert(`Erro na tabela notifications: ${notificationError.message}`);
        throw notificationError;
      }

      console.log("Notificação atualizada com sucesso!");

      // 3. Atualiza o estado local para sumir os botões imediatamente
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, type: 'follow' } : n)
      );
    } catch (error: any) {
      console.error("Erro geral no handleAcceptRequest:", error);
    }
  };

  // Recusar/Excluir solicitação de conexão
  const handleDeclineRequest = async (e: React.MouseEvent, notification: any) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // 1. Deleta a relação na tabela follows
      const { error: followError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', notification.from_user_id)
        .eq('following_id', notification.user_id);

      if (followError) {
        console.error("Erro ao deletar da tabela 'follows':", followError);
        throw followError;
      }

      // 2. Deleta a notificação
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notification.id);

      if (notificationError) {
        console.error("Erro ao deletar da tabela 'notifications':", notificationError);
        throw notificationError;
      }

      // 3. Remove a linha da interface
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } catch (error) {
      console.error("Erro ao recusar solicitação:", error);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'like') return <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />;
    if (type === 'follow') return <UserPlus className="w-3.5 h-3.5 text-blue-500" />;
    if (type === 'solicitacao_seguir') return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    if (type === 'frame_gift') return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
    return <Bell className="w-3.5 h-3.5 text-gray-400" />;
  };

  const getText = (n: any) => {
    if (n.type === 'like') return 'curtiu sua foto';
    if (n.type === 'follow') return 'começou a te seguir';
    if (n.type === 'solicitacao_seguir') return 'solicitou seguir você';
    if (n.type === 'frame_gift') return '';
    return '';
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Notificações</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 opacity-30" />
              </div>
              <p className="text-base font-medium text-gray-500">Nenhuma notificação</p>
              <p className="text-sm mt-1">As interações aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-gray-400 px-1 mb-2">Últimas notificações</p>
              {notifications.map((n) => {
                
                // CASO 1: PRESENTES ESPECIAIS (MOLDURAS)
                if (n.type === 'frame_gift') {
                  return (
                    <Link
                      key={n.id}
                      href="/dashboard/molduras"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 hover:from-purple-100 hover:to-blue-100 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-green-400 flex items-center justify-center flex-shrink-0 animate-spin-slow">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">🎁 Presente Especial!</p>
                        <p className="text-sm text-gray-700 mt-0.5">
                          Você ganhou a <span className="font-bold text-purple-600">Moldura Aurora</span> exclusiva!
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Disponível até 22 de outubro • Toque para resgatar</p>
                      </div>
                    </Link>
                  );
                }

                // CASO 2: SOLICITAÇÕES DE SEGUIR PENDENTES (DIV Estática, sem Link pai bugar)
                if (n.type === 'solicitacao_seguir') {
                  return (
                    <div
                      key={n.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
                    >
                      <div className="relative flex-shrink-0">
                        <Link href={`/${n.from_user?.username}`} className="block w-12 h-12 rounded-full bg-gray-100 overflow-hidden hover:opacity-90 transition-opacity">
                          {n.from_user?.avatar_url ? (
                            <img src={n.from_user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                              {n.from_user?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </Link>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                          {getIcon(n.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <Link href={`/${n.from_user?.username}`} className="font-semibold hover:underline">
                            {n.from_user?.full_name}
                          </Link>{' '}
                          <span className="text-gray-500">{getText(n)}</span>
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(n.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Botões rápidos de Confirmar/Excluir */}
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <button
                          onClick={(e) => handleAcceptRequest(e, n)}
                          className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-all flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirmar</span>
                        </button>
                        <button
                          onClick={(e) => handleDeclineRequest(e, n)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // CASO 3: OUTRAS NOTIFICAÇÕES (LIKE, FOLLOW COMUM) - Link simples e limpo
                return (
                  <Link
                    key={n.id}
                    href={`/${n.from_user?.username}`}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                        {n.from_user?.avatar_url ? (
                          <img src={n.from_user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                            {n.from_user?.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                        {getIcon(n.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{n.from_user?.full_name}</span>{' '}
                        <span className="text-gray-500">{getText(n)}</span>
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(n.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}