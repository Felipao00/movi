'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { 
  ArrowLeft, Eye, ShieldCheck, Lock, UserCheck, 
  AlertCircle, MessageSquare, Check
} from 'lucide-react';

export default function PrivacidadePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Estados reais das configurações no banco
  const [contaPrivada, setContaPrivada] = useState(false);
  const [mostrarOnline, setMostrarOnline] = useState(true);
  const [permitirDMs, setPermitirDMs] = useState<'todos' | 'seguidores' | 'ninguem'>('todos');

  // Controle de Modais e UI de carregamento local
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [showDmOptions, setShowDmOptions] = useState(false);
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
        
        const { data } = await supabase
          .from('profiles')
          .select('is_private, show_online, allow_dms')
          .eq('id', user.id)
          .single();

        if (data) {
          setContaPrivada(data.is_private || false);
          setMostrarOnline(data.show_online !== false); // default true
          setPermitirDMs(data.allow_dms || 'todos');
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de privacidade:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Função genérica para salvar no Supabase de forma persistente
  const atualizarNoBanco = async (campo: string, valor: any) => {
    if (!userId) return false;
    setIsUpdating(campo);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [campo]: valor })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error(`Erro ao atualizar campo ${campo}:`, e);
      alert('Não foi possível salvar sua alteração. Tente novamente.');
      return false;
    } finally {
      setIsUpdating(null);
    }
  };

  // 1. Lógica de Conta Privada (Abre o Modal antes de salvar)
  const handleTogglePrivada = async () => {
    if (!contaPrivada) {
      // Se vai ativar o modo privado, primeiro exibe o aviso explicativo
      setShowPrivateModal(true);
    } else {
      // Se vai desativar (voltar para pública), faz direto
      const sucesso = await atualizarNoBanco('is_private', false);
      if (sucesso) setContaPrivada(false);
    }
  };

  const confirmarContaPrivada = async () => {
    const sucesso = await atualizarNoBanco('is_private', true);
    if (sucesso) {
      setContaPrivada(true);
      setShowPrivateModal(false);
    }
  };

  // 2. Lógica do Status de Atividade
  const handleToggleOnline = async () => {
    const novoValor = !mostrarOnline;
    const sucesso = await atualizarNoBanco('show_online', novoValor);
    if (sucesso) setMostrarOnline(novoValor);
  };

  // 3. Lógica de Mensagens Diretas (DMs)
  const selecionarOpcaoDM = async (opcao: 'todos' | 'seguidores' | 'ninguem') => {
    const sucesso = await atualizarNoBanco('allow_dms', opcao);
    if (sucesso) {
      setPermitirDMs(opcao);
      setShowDmOptions(false);
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
            <h1 className="text-base font-semibold text-gray-900 ml-2">Privacidade</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-6">
          
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Privacidade da Conta</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              
              {/* Conta Privada */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Lock className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Conta privada</p>
                    <p className="text-gray-400 text-xs mt-0.5">Somente pessoas aprovadas por você poderão ver suas fotos e interagir no perfil.</p>
                  </div>
                </div>
                <button
                  onClick={handleTogglePrivada}
                  disabled={isUpdating === 'is_private'}
                  className={`w-11 h-6 rounded-full transition-colors relative outline-none shrink-0 ${
                    contaPrivada ? 'bg-black' : 'bg-gray-200'
                  } ${isUpdating === 'is_private' ? 'opacity-50' : ''}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    contaPrivada ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="border-t border-gray-100 mx-4" />

              {/* Status de Atividade */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Eye className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Status de atividade</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {mostrarOnline 
                        ? 'As pessoas que você segue e conversa podem ver quando você está online ou esteve recentemente.' 
                        : 'Seu status está oculto. Você também não poderá ver o status online de outras pessoas.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleOnline}
                  disabled={isUpdating === 'show_online'}
                  className={`w-11 h-6 rounded-full transition-colors relative outline-none shrink-0 ${
                    mostrarOnline ? 'bg-black' : 'bg-gray-200'
                  } ${isUpdating === 'show_online' ? 'opacity-50' : ''}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    mostrarOnline ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="border-t border-gray-100 mx-4" />

              {/* Mensagens Diretas (DMs) */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setShowDmOptions(!showDmOptions)}
              >
                <div className="flex items-start gap-3 max-w-[80%]">
                  <UserCheck className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Mensagens diretas (DM)</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Quem pode enviar solicitações de chat: <span className="text-black font-semibold capitalize">{permitirDMs === 'todos' ? 'Qualquer pessoa' : permitirDMs === 'seguidores' ? 'Apenas quem sigo' : 'Ninguém'}</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-400">Configurar</span>
              </div>

              {/* Acordeão de Opções das DMs */}
              {showDmOptions && (
                <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-2 animate-none">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quem pode te enviar mensagens</p>
                  
                  {/* Opção 1: Todos */}
                  <button 
                    onClick={() => selecionarOpcaoDM('todos')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 text-left hover:border-gray-400 transition-colors"
                  >
                    <div>
                      <p className="text-gray-900 text-sm font-medium">Qualquer pessoa</p>
                      <p className="text-gray-400 text-xs">Qualquer usuário do MOVI pode iniciar um chat com você.</p>
                    </div>
                    {permitirDMs === 'todos' && <Check className="w-4 h-4 text-black shrink-0" />}
                  </button>

                  {/* Opção 2: Quem sigo */}
                  <button 
                    onClick={() => selecionarOpcaoDM('seguidores')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 text-left hover:border-gray-400 transition-colors"
                  >
                    <div>
                      <p className="text-gray-900 text-sm font-medium">Apenas contas que você segue</p>
                      <p className="text-gray-400 text-xs">Somente perfis que você segue de volta podem te mandar mensagens.</p>
                    </div>
                    {permitirDMs === 'seguidores' && <Check className="w-4 h-4 text-black shrink-0" />}
                  </button>

                  {/* Opção 3: Ninguém */}
                  <button 
                    onClick={() => selecionarOpcaoDM('ninguem')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 text-left hover:border-gray-400 transition-colors"
                  >
                    <div>
                      <p className="text-gray-900 text-sm font-medium">Ninguém</p>
                      <p className="text-gray-400 text-xs">Bloqueia o recebimento de novas solicitações de bate-papo de qualquer conta.</p>
                    </div>
                    {permitirDMs === 'ninguem' && <Check className="w-4 h-4 text-black shrink-0" />}
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Banner Informativo */}
          <div className="rounded-2xl bg-green-50 border border-green-100 p-4 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <h4 className="text-green-900 text-xs font-semibold uppercase tracking-wider">Segurança MOVI</h4>
              <p className="text-green-700 text-xs mt-1 leading-relaxed">
                Suas fotos protegidas e criptografia de chat garantem que suas conversas permaneçam sempre entre você e seus contatos selecionados.
              </p>
            </div>
          </div>

        </div>
      </Container>

      {/* MODAL DE CONFIRMAÇÃO: MUDAR PARA CONTA PRIVADA */}
      {showPrivateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-none">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-gray-900 text-lg font-bold text-center mb-2">Mudar para conta privada?</h3>
            
            <div className="space-y-3 text-gray-500 text-sm mb-6 mt-4">
              <div className="flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p>Apenas pessoas que você aprovar poderão ver suas fotos e vídeos publicados.</p>
              </div>
              <div className="flex gap-2.5 items-start">
                <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p>Seus seguidores atuais não serão afetados e continuarão vendo seu perfil.</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={confirmarContaPrivada}
                className="w-full py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 active:scale-95 transition-all"
              >
                Mudar para privada
              </button>
              <button 
                onClick={() => setShowPrivateModal(false)} 
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}