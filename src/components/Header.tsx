'use client';

import { useUser } from '@/hooks/useUser';
import { useItems } from '@/hooks/useItems';

export default function Header() {
  const { user } = useUser();
  const { items } = useItems(user?.uid || '');
  
  const remaining = items?.filter(item => !item.is_checked).length || 0;

  return (
    <header 
      className="fixed w-full bg-neutral-900 z-50"
      style={{ 
        top: 'env(safe-area-inset-top)',
        height: 'calc(3rem + env(safe-area-inset-top))'
      }}
    >
      <div className="px-4 py-3">
        <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
          {remaining} left
        </span>
      </div>
    </header>
  );
} 