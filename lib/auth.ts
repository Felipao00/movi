import { supabase } from './supabase';

export async function signUp(email: string, password: string, username: string, fullName: string) {
  // Tenta criar o usuário
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
      data: {
        full_name: fullName,
        username: username,
      },
    },
  });

  // Se o usuário foi criado (mesmo com erro de confirmação)
  if (authData?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        full_name: fullName,
        theme: 'black',
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
    }
    
    // Força login imediato
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      console.error('Erro ao fazer login:', signInError);
    }
  } else if (authError) {
    // Se o erro for de rate limit, tenta fazer login (usuário pode já existir)
    if (authError.message?.includes('rate limit') || authError.message?.includes('already')) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) throw signInError;
      return signInData;
    }
    throw authError;
  }

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function getProfileByUsername(username: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  return data;
}