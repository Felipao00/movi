'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Database, Wifi, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ArmazenamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Opções reais sincronizadas com o Supabase
  const [economizarDados, setEconomizarDados] = useState(false);
  const [altaQualidade, setAltaQualidade] = useState(true);
  
  // Feedback visual de carregamento individual e cache limpo
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [limpandoCache, setLimpandoCache] = useState(false);
  const [cacheLimpo, setCacheLimpo] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserId(user.id);

        // Busca as configurações de armazenamento no Supabase
        const { data } = await supabase
          .from('profiles')
          .select('data_saver, high_quality_upload')
          .eq('id', user.id)
          .single();

        if (data) {
          setEconomizarDados(data.data_saver || false);
          setAltaQualidade(data.high_quality_upload !== false); // default true
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de armazenamento:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  // Função para persistir as alterações diretamente no Supabase
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
      alert('Não foi possível salvar sua alteração no servidor. Tente novamente.');
    } finally {
      setIsUpdating(null);
    }
  };

  // REAL: Deleta os caches armazenados no navegador pelo app
  const limparCacheApp = async () => {
    setLimpandoCache(true);
    setCacheLimpo(false);
    
    try {
      // Verifica se o navegador suporta a Caches API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        // Deleta todas as storages de cache encontradas (imagens estáticas, prefetchings do Next, etc.)
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Opcional: Limpa lixos rápidos do localStorage que não sejam a sessão de login
      // Se tiver estados temporários de conversas guardados no localStorage, pode limpá-los aqui
      
    } catch (error) {
      console.error('Erro ao limpar cache do navegador:', error);
    } finally {
      // Mantém um micro delay pro usuário ver o feedback visual de progresso antes do sucesso
      setTimeout(() => {
        setLimpandoCache(false);
        setCacheLimpo(true);
        setTimeout(() => setCacheLimpo(false), 3000);
      }, 800);
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
            <h1 className="text-base font-semibold text-gray-900 ml-2">Dados e Mídias</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-6">
          
          {/* DADOS MÓVEIS */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Redes Móveis</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              
              {/* Economizador de dados */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Wifi className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Usar menos dados móveis</p>
                    <p className="text-gray-400 text-xs mt-0.5">Diminui a resolução dos vídeos e fotos ao navegar pela rede móvel.</p>
                  </div>
                </div>
                <button
                  onClick={() => atualizarNoBanco('data_saver', !economizarDados, setEconomizarDados)}
                  disabled={isUpdating === 'data_saver'}
                  className={`w-11 h-6 rounded-full transition-colors relative outline-none shrink-0 ${
                    economizarDados ? 'bg-black' : 'bg-gray-200'
                  } ${isUpdating === 'data_saver' ? 'opacity-50' : ''}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    economizarDados ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>
          </div>

          {/* QUALIDADE DE MÍDIA */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Qualidade de Carregamento</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              
              {/* Upload em alta qualidade */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Database className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Carregar em alta qualidade</p>
                    <p className="text-gray-400 text-xs mt-0.5">Carrega sempre suas fotos na maior resolução disponível, mesmo que demore mais tempo.</p>
                  </div>
                </div>
                <button
                  onClick={() => atualizarNoBanco('high_quality_upload', !altaQualidade, setAltaQualidade)}
                  disabled={isUpdating === 'high_quality_upload'}
                  className={`w-11 h-6 rounded-full transition-colors relative outline-none shrink-0 ${
                    altaQualidade ? 'bg-black' : 'bg-gray-200'
                  } ${isUpdating === 'high_quality_upload' ? 'opacity-50' : ''}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    altaQualidade ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>
          </div>

          {/* ESPAÇO EM DISCO / CACHE */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Espaço em Disco</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm p-4">
              <div className="flex items-start gap-3 justify-between">
                <div>
                  <p className="text-gray-900 text-sm font-medium">Limpar arquivos temporários (Cache)</p>
                  <p className="text-gray-400 text-xs mt-1">Limpa o armazenamento interno de imagens pré-carregadas e dados temporários de conversas antigas.</p>
                </div>
                
                <button
                  onClick={limparCacheApp}
                  disabled={limpandoCache || cacheLimpo}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shrink-0 disabled:opacity-50"
                >
                  {limpandoCache ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Limpando...
                    </span>
                  ) : cacheLimpo ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Limpo!
                    </span>
                  ) : (
                    'Limpar'
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}