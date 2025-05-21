'use client';

import { usePathname } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import BottomNav from './BottomNav';

export default function BottomNavWrapper() {
  const { user } = useUser();
  const pathname = usePathname();

  // Don't show nav on auth page
  if (!user || pathname === '/auth') {
    return null;
  }

  return <BottomNav />;
} 