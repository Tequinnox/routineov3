'use client';

import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return null; // Will redirect

  return (
    <div className="p-4">
      <p>Welcome, {user.email}</p>
    </div>
  );
}
