'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Mail, Smartphone, Heart, MessageSquare, UserPlus } from 'lucide-react';

export default function NotificacoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Estados reais das configurações de notificação
  const [pushLikes, setPushLikes] = useState(true);
  const [pushComments, setPushComments] = useState(true);
  const [pushFollows, setPushFollows] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  // Controle de carregamento individual por campo
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserId(user.id);
        
        // Busca as configurações de notificação no banco de dados
        const { data } = await supabase
          .from('profiles')
          .select('push_likes, push_comments, push_follows, email_digest')
          .eq('id', user.id)
          .single();

        if (data) {
          setPushLikes(data.push_likes !== false); // default true
          setPushComments(data.push_comments !== false); // default true
          setPushFollows(data.push_follows !== false); // default true
          setEmailDigest(data.email_digest || false); // default false
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de notificações:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Função para salvar as alterações no banco de dados de forma persistente
  const atualizarNoBanco = async (campo: string, valor: boolean, setEstado: (val: boolean) => void) => {
    if (!userId) return;
    setIsUpdating(campo);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [campo]: valor })
        .eq('id', userId);

      if (error) throw error;
      setEstado(valor);
    } catch (e) {
      console.error(`Erro ao atualizar campo ${campo}:`, e);
      alert('Não foi possível salvar sua preferência. Tente novamente.');
    } finally {
      setIsUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-gray-200">
        <Container>
          <div className="flex items-center h-14">
            <button 
              onClick={() => router.push('/dashboard/configuracoes')} 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900 ml-2">Notificações</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-6">
          
          {/* NOTIFICAÇÕES EM TEMPO REAL (PUSH) */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Notificações Push</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              
              {/* Curtidas */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Heart className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Curtidas nas fotos</p>
                    <p className="text-gray-400 text-xs mt-0.5">Receba avisos instantâneos quando alguém curtir suas publicações.</p>
                  </div>
                </div>
                <button
                  onClick={() => atualizarNoBanco('push_likes', !pushLikes, setPushLikes)}
                  disabled={isUpdating === 'push_likes'}
                  className={`w-11 h-6 rounded-full transition-colors relative outline-none shrink-0 ${
                    pushLikes ? 'bg-black' : 'bg-gray-200'
                  } ${isUpdating === 'push_likes' ? 'opacity-50' : ''}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    pushLikes ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="border-t border-gray-100 mx-4" />

              {/* Comentários */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Novos comentários</p>
                    <p className="text-gray-400 text-xs mt-0.5">Seja notificado quando alguém comentar nas suas fotos ou te marcar.</p>
                  </div>
                </div>
                <button
                  onClick={() => atualizarNoBanco('push_comments', !pushComments, setPushComments)}
                  disabled={isUpdating === 'push_comments'}
                  className={`w-11 h-6 rounded-full transition-colors relative outline-none shrink-0 ${
                    pushComments ? 'bg-black' : 'bg-gray-200'
                  } ${isUpdating === 'push_comments' ? 'opacity-50' : ''}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    pushComments ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="border-t border-gray-100 mx-4" />

              {/* Novos Seguidores */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <UserPlus className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Novos seguidores</p>
                    <p className="text-gray-400 text-xs mt-0.5">Avise-me quando um novo usuário começar a me seguir ou solicitar permissão.</p>
                  </div>
                </div>
                <button
                  onClick={() => atualizarNoBanco('push_follows', !pushFollows, setPushFollows)}
                  disabled={isUpdating === 'push_follows'}
                  className={`w-11 h-6 rounded-full transition-colors relative outline-none shrink-0 ${
                    pushFollows ? 'bg-black' : 'bg-gray-200'
                  } ${isUpdating === 'push_follows' ? 'opacity-50' : ''}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    pushFollows ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>
          </div>

          {/* NOTIFICAÇÕES POR E-MAIL */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Comunicações por E-mail</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              
              {/* Informativos por e-mail */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Resumo de atividade semanal</p>
                    <p className="text-gray-400 text-xs mt-0.5">Receba um e-mail com as fotos em destaque e novas atividades da sua rede.</p>
                  </div>
                </div>
                <button
                  onClick={() => atualizarNoBanco('email_digest', !emailDigest, setEmailDigest)}
                  disabled={isUpdating === 'email_digest'}
                  className={`w-11 h-6 rounded-full transition-colors relative outline-none shrink-0 ${
                    emailDigest ? 'bg-black' : 'bg-gray-200'
                  } ${isUpdating === 'email_digest' ? 'opacity-50' : ''}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    emailDigest ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>
          </div>

          {/* Banner Informativo */}
          <div className="rounded-2xl bg-gray-100 border border-gray-200 p-4 flex gap-3">
            <Smartphone className="w-5 h-5 text-gray-500 shrink-0" />
            <div>
              <h4 className="text-gray-900 text-xs font-semibold uppercase tracking-wider">Ajustes do dispositivo</h4>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Lembre-se de permitir o recebimento de notificações nas configurações globais do sistema operacional do seu celular ou navegador.
              </p>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}