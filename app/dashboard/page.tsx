'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Onboarding } from '@/components/onboarding/Onboarding';

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile && !profile.onboarding_done) {
      setShowOnboarding(true);
    } else {
      router.push('/');
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding />;
  }

  return null;
}