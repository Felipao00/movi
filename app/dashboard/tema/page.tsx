'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Check, Sun, Moon } from 'lucide-react';

export default function TemaPage() {
  const router = useRouter();
  const [currentTheme, setCurrentTheme] = useState('light');
  const [message, setMessage] = useState('');

  useEffect(() => { loadTheme(); }, []);

  const loadTheme = async () => {
    const user = await getCurrentUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('theme').eq('id', user.id).single();
    if (data?.theme) setCurrentTheme(data.theme);
  };

  const handleThemeChange = async (theme: string) => {
    const user = await getCurrentUser();
    if (!user) return;
    setCurrentTheme(theme);
    await supabase.from('profiles').update({ theme }).eq('id', user.id);
    setMessage('Tema atualizado!');
    setTimeout(() => setMessage(''), 2000);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <Container>
          <div className="flex items-center h-14">
            <button onClick={() => router.push('/dashboard/configuracoes')} className="p-2 -ml-2 text-text-secondary hover:text-text-primary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-medium text-text-primary ml-2">Tema</h1>
          </div>
        </Container>
      </header>

      <Container size="small">
        <div className="py-6">
          {message && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm text-center">
              {message}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => handleThemeChange('light')}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                currentTheme === 'light'
                  ? 'bg-accent/5 border-accent/30'
                  : 'bg-surface border-border hover:bg-border/5'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <Sun className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-text-primary text-base font-semibold">Claro</p>
                <p className="text-text-muted text-sm">Tema claro minimalista</p>
              </div>
              {currentTheme === 'light' && (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-4 h-4 text-background" />
                </div>
              )}
            </button>

            <button
              onClick={() => handleThemeChange('dark')}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                currentTheme === 'dark'
                  ? 'bg-accent/5 border-accent/30'
                  : 'bg-surface border-border hover:bg-border/5'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-sm">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-text-primary text-base font-semibold">Escuro</p>
                <p className="text-text-muted text-sm">Tema escuro elegante</p>
              </div>
              {currentTheme === 'dark' && (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-4 h-4 text-background" />
                </div>
              )}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}