'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';

interface SwipeNavigationProps {
  children: React.ReactNode;
  currentUser: any;
  userProfile: any;
}

export function SwipeNavigation({ children, currentUser, userProfile }: SwipeNavigationProps) {
  const router = useRouter();

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (window.location.pathname === '/') router.push('/explorar');
      else if (window.location.pathname === '/explorar' && userProfile) router.push(`/${userProfile.username}`);
    },
    onSwipedRight: () => {
      if (window.location.pathname === '/explorar') router.push('/');
      else if (userProfile && window.location.pathname === `/${userProfile.username}`) router.push('/explorar');
    },
    trackMouse: false,
    delta: 80,
  });

  return (
    <div {...handlers} className="min-h-screen touch-pan-y">
      {children}
    </div>
  );
}