'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, User, Lock, Mail, Shuffle, AlertCircle, Sparkles, X } from 'lucide-react';

const steps = [
  { id: 1, title: 'Escolha seu @', subtitle: 'Seu nome único na MOVI' },
  { id: 2, title: 'Crie sua senha', subtitle: 'Segurança em primeiro lugar' },
  { id: 3, title: 'Como entrar?', subtitle: 'Escolha seu método de acesso' },
];

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const checkTimer = useRef<any>(null);

  const passwordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength();
  const strengthLabels = ['', 'Fraca', 'Média', 'Boa', 'Forte'];
  const strengthColors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];

  const checkUsername = async (name: string) => {
    if (name.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', name.toLowerCase())
      .single();
    setUsernameAvailable(data ? false : true);
    setCheckingUsername(false);
  };

  const handleUsernameChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);
    setUsernameAvailable(null);
    
    if (checkTimer.current) clearTimeout(checkTimer.current);
    
    if (clean.length >= 3) {
      checkTimer.current = setTimeout(() => checkUsername(clean), 600);
    }
  };

  const handleNext = () => {
    setError('');
    
    if (step === 1) {
      if (!username || username.length < 3) {
        setError('Nome de usuário deve ter pelo menos 3 caracteres');
        return;
      }
      if (usernameAvailable === false) {
        setError('Este nome de usuário já está em uso. Escolha outro.');
        return;
      }
      if (usernameAvailable === null) {
        setError('Aguarde a verificação do nome de usuário');
        return;
      }
    }
    
    if (step === 2 && password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setDirection(1);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setDirection(-1);
    setStep(step - 1);
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) setError('Erro ao conectar com Google');
    setLoading(false);
  };

  const handleEmailSignUp = async () => {
    if (!email) { setError('Digite seu email'); return; }
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (authError) throw authError;
      if (authData?.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          username: username.toLowerCase(),
          full_name: username,
          theme: 'light',
        });
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    }
    setLoading(false);
  };

  const handleGuestSignUp = async () => {
    setLoading(true);
    const guestEmail = `guest_${username}_${Date.now()}@movi.temp`;
    const guestPassword = `Guest_${Date.now()}_${Math.random()}`;
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: { data: { username } }
      });
      if (authError) throw authError;
      if (authData?.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          username: username.toLowerCase(),
          full_name: username,
          theme: 'light',
          is_guest: true,
        });
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    }
    setLoading(false);
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
  };

  const getUsernameBorder = () => {
    if (!username || username.length < 3) return 'border-gray-200';
    if (checkingUsername) return 'border-yellow-300';
    if (usernameAvailable === true) return 'border-green-400';
    if (usernameAvailable === false) return 'border-red-400';
    return 'border-gray-200';
  };

  const getUsernameBg = () => {
    if (!username || username.length < 3) return '';
    if (usernameAvailable === true) return 'bg-green-50';
    if (usernameAvailable === false) return 'bg-red-50';
    return '';
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <Container size="small">
        <div className="w-full max-w-md mx-auto">
          {/* Progresso */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  step >= s.id ? 'bg-gray-900 scale-100' : 'bg-gray-300 scale-75'
                }`} />
                {s.id < 3 && <div className={`w-8 h-[1px] transition-all duration-500 ${
                  step > s.id ? 'bg-gray-900' : 'bg-gray-300'
                }`} />}
              </div>
            ))}
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <motion.h2
              key={`title-${step}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-900 mb-1"
            >
              {steps[step - 1].title}
            </motion.h2>
            <motion.p
              key={`subtitle-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-500 text-sm"
            >
              {steps[step - 1].subtitle}
            </motion.p>
          </div>

          {/* Erro */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Etapas */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* ETAPA 1 - Username */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="relative">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                      usernameAvailable === true ? 'text-green-500' :
                      usernameAvailable === false ? 'text-red-400' :
                      'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="seunome"
                      className={`w-full pl-12 pr-12 py-4 rounded-2xl border-2 text-gray-900 text-lg focus:outline-none transition-all ${getUsernameBorder()} ${getUsernameBg()}`}
                      autoFocus
                    />
                    {username && username.length >= 3 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {checkingUsername ? (
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : usernameAvailable === true ? (
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        ) : usernameAvailable === false ? (
                          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="w-4 h-4 text-red-500" />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Feedback visual */}
                  {username && username.length >= 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                      {usernameAvailable === true && (
                        <p className="text-green-600 text-sm font-medium">✓ @{username} está disponível!</p>
                      )}
                      {usernameAvailable === false && (
                        <p className="text-red-500 text-sm font-medium">✗ @{username} já está em uso</p>
                      )}
                      {usernameAvailable === null && !checkingUsername && (
                        <p className="text-gray-400 text-sm">Verificando...</p>
                      )}
                    </motion.div>
                  )}

                  <p className="text-gray-400 text-xs text-center">
                    Apenas letras, números e underline. Mínimo 3 caracteres.
                  </p>
                </div>
              )}

              {/* ETAPA 2 - Senha */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 text-lg focus:outline-none focus:border-gray-900 transition-all"
                      autoFocus
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {password && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength ? strengthColors[strength] : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${
                        strength <= 1 ? 'text-red-500' :
                        strength === 2 ? 'text-orange-500' :
                        strength === 3 ? 'text-yellow-600' :
                        'text-green-500'
                      }`}>
                        {strengthLabels[strength]}
                      </p>
                    </motion.div>
                  )}

                  <div className="space-y-2 text-xs text-gray-400">
                    <p className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-500 font-medium' : ''}`}>
                      {password.length >= 8 ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      Mínimo 8 caracteres
                    </p>
                    <p className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-500 font-medium' : ''}`}>
                      {/[A-Z]/.test(password) ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      Uma letra maiúscula
                    </p>
                    <p className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-500 font-medium' : ''}`}>
                      {/[0-9]/.test(password) ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      Um número
                    </p>
                    <p className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-500 font-medium' : ''}`}>
                      {/[^A-Za-z0-9]/.test(password) ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                      Um caractere especial
                    </p>
                  </div>
                </div>
              )}

              {/* ETAPA 3 - Método */}
              {step === 3 && (
                <div className="space-y-3">
                  <button
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-gray-200 hover:border-gray-900 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-gray-900 font-medium">Continuar com Google</p>
                      <p className="text-gray-400 text-xs">Conta salva permanentemente</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="p-5 rounded-2xl bg-white border-2 border-gray-200 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900 font-medium text-sm">Ou use seu email</p>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-gray-900 transition-all"
                    />
                    <button
                      onClick={handleEmailSignUp}
                      disabled={loading || !email}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-30 transition-all"
                    >
                      Criar conta com email
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Shuffle className="w-4 h-4 text-amber-600" />
                      <p className="text-amber-900 font-medium text-sm">Modo Convidado</p>
                    </div>
                    <div className="bg-amber-100/50 rounded-xl p-3 text-amber-800 text-xs space-y-1">
                      <p>⚠️ Conta temporária - não será salva</p>
                      <p>⚠️ Se limpar os dados do app, a conta será perdida</p>
                      <p>💡 Depois você pode vincular um email nas configurações</p>
                    </div>
                    <button
                      onClick={handleGuestSignUp}
                      disabled={loading}
                      className="w-full py-3 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Entrar como Convidado
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Botões */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-900 font-medium text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            )}
            {step < 3 && (
              <button
                onClick={handleNext}
                disabled={step === 1 && (usernameAvailable === false || usernameAvailable === null)}
                className={`flex-1 py-3.5 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  step === 1 && (usernameAvailable === false || usernameAvailable === null)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-center text-gray-400 text-sm mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-gray-900 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}