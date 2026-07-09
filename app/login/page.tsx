'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, User, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trocaEmail = searchParams.get('email');
  
  const [method, setMethod] = useState<'choose' | 'email' | 'username'>('choose');
  const [email, setEmail] = useState(trocaEmail || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // Se veio da troca de conta, já abre no email
  useEffect(() => {
    if (trocaEmail) {
      setMethod('email');
    }
  }, [trocaEmail]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) {
      setError('Erro ao conectar com Google');
      setShake(true);
    }
    setLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha todos os campos');
      setShake(true);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Salva a conta automaticamente
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          await supabase.from('saved_accounts').upsert({
            owner_id: data.user.id,
            account_id: data.user.id,
            email: email,
          }, { onConflict: 'owner_id,account_id' }).select();
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError('Email ou senha incorretos');
      setShake(true);
    }
    setLoading(false);
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Preencha todos os campos');
      setShake(true);
      return;
    }
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .single();
      
      if (!profile) {
        setError('Usuário não encontrado');
        setShake(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${profile.id}@movi.user`,
        password,
      });

      if (error) {
        setError('Senha incorreta');
        setShake(true);
        return;
      }

      // Salva a conta
      if (data?.user) {
        await supabase.from('saved_accounts').upsert({
          owner_id: data.user.id,
          account_id: data.user.id,
          email: data.user.email || '',
        }, { onConflict: 'owner_id,account_id' }).select();
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Erro ao fazer login');
      setShake(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (shake) setTimeout(() => setShake(false), 500);
  }, [shake]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <Container size="small">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="font-signature text-5xl text-gray-900">MOVI</h1>
            </Link>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0, x: shake ? [0, -10, 10, -10, 10, 0] : 0 }}
                transition={{ x: { duration: 0.4 } }}
                exit={{ opacity: 0 }}
                className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {method === 'choose' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Como deseja entrar?</h2>

              <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-900 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="text-left flex-1"><p className="text-gray-900 font-medium">Google</p><p className="text-gray-400 text-xs">Rápido e seguro</p></div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button onClick={() => setMethod('email')} className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-900 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform"><Mail className="w-6 h-6 text-blue-500" /></div>
                <div className="text-left flex-1"><p className="text-gray-900 font-medium">Email</p><p className="text-gray-400 text-xs">Entrar com email e senha</p></div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button onClick={() => setMethod('username')} className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-900 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-105 transition-transform"><User className="w-6 h-6 text-purple-500" /></div>
                <div className="text-left flex-1"><p className="text-gray-900 font-medium">@username</p><p className="text-gray-400 text-xs">Entrar com seu @ da MOVI</p></div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {method === 'email' && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <button onClick={() => setMethod('choose')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-4"><ArrowLeft className="w-4 h-4" />Voltar</button>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Entrar com Email</h2>
              <p className="text-gray-500 text-sm text-center mb-6">Use o email da sua conta MOVI</p>
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-gray-900 transition-all" autoFocus /></div>
                <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-gray-900 transition-all" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}{loading ? 'Entrando...' : 'Entrar'}</button>
              </form>
            </motion.div>
          )}

          {method === 'username' && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <button onClick={() => setMethod('choose')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-4"><ArrowLeft className="w-4 h-4" />Voltar</button>
              <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Entrar com @username</h2>
              <p className="text-gray-500 text-sm text-center mb-6">Use seu nome de usuário da MOVI</p>
              <form onSubmit={handleUsernameLogin} className="space-y-3">
                <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="@seunome" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-gray-900 transition-all" autoFocus /></div>
                <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-gray-900 transition-all" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
                <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}{loading ? 'Entrando...' : 'Entrar'}</button>
              </form>
            </motion.div>
          )}

          <p className="text-center text-gray-400 text-sm mt-8">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-gray-900 font-medium hover:underline">Criar agora</Link>
          </p>
        </div>
      </Container>
    </div>
  );
}