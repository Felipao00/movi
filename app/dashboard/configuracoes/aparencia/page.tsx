'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Sun, Moon, Laptop, Type, Check } from 'lucide-react';

export default function AparenciaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tema, setTema] = useState<'light' | 'dark' | 'system'>('light');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    // Carrega as configurações salvas do localStorage
    const temaSalvo = localStorage.getItem('movi-theme') as 'light' | 'dark' | 'system';
    const fonteSalva = localStorage.getItem('movi-font-size') as 'small' | 'medium' | 'large';
    
    if (temaSalvo) setTema(temaSalvo);
    if (fonteSalva) setFontSize(fonteSalva);
    
    setLoading(false);
  }, []);

  const alterarTema = (novoTema: 'light' | 'dark' | 'system') => {
    setTema(novoTema);
    localStorage.setItem('movi-theme', novoTema);
    
    // lógica opcional para aplicar a classe dark na tag HTML no seu projeto Next.js:
    if (novoTema === 'dark' || (novoTema === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const alterarFonte = (novoTamanho: 'small' | 'medium' | 'large') => {
    setFontSize(novoTamanho);
    localStorage.setItem('movi-font-size', novoTamanho);
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
            <h1 className="text-base font-semibold text-gray-900 ml-2">Aparência</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6 space-y-6">
          
          {/* SELEÇÃO DE TEMA */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Tema do aplicativo</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              
              {/* Claro */}
              <button
                onClick={() => alterarTema('light')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Modo Claro</p>
                    <p className="text-gray-400 text-xs">Visual limpo e brilhante para ambientes bem iluminados</p>
                  </div>
                </div>
                {tema === 'light' && <Check className="w-4 h-4 text-black" />}
              </button>

              <div className="border-t border-gray-100 mx-4" />

              {/* Escuro */}
              <button
                onClick={() => alterarTema('dark')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Modo Escuro</p>
                    <p className="text-gray-400 text-xs">Visual escurecido e confortável para uso noturno</p>
                  </div>
                </div>
                {tema === 'dark' && <Check className="w-4 h-4 text-black" />}
              </button>

              <div className="border-t border-gray-100 mx-4" />

              {/* Sistema */}
              <button
                onClick={() => alterarTema('system')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-900 text-sm font-medium">Padrão do Sistema</p>
                    <p className="text-gray-400 text-xs">Sincroniza automaticamente com a aparência do seu dispositivo</p>
                  </div>
                </div>
                {tema === 'system' && <Check className="w-4 h-4 text-black" />}
              </button>

            </div>
          </div>

          {/* ACESSIBILIDADE DE TEXTO */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Acessibilidade de Texto</h2>
            <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 flex items-start gap-3">
                <Type className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gray-900 text-sm font-medium">Tamanho do texto</p>
                  <p className="text-gray-400 text-xs mt-0.5">Ajuste o tamanho de leitura do chat e legendas.</p>
                  
                  <div className="flex gap-2 mt-4">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => alterarFonte(size)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all capitalize ${
                          fontSize === size
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {size === 'small' ? 'Pequeno' : size === 'medium' ? 'Padrão' : 'Grande'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}