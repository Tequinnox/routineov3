'use client';

import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useItems } from '@/hooks/useItems';
import { ItemCard, type RoutineItem } from '@/components/ItemCard';
import AuthGuard from '@/components/AuthGuard';
import { useDailyReset } from '@/hooks/useDailyReset';

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { items, loading: itemsLoading, error: itemsError, toggleItem } = useItems(user?.uid || '');
  const { isChecking: isResetting } = useDailyReset({ userId: user?.uid || '' });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  if (loading || itemsLoading || isResetting) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto">Loading...</div>
      </div>
    );
  }

  if (!user) return null; // Will redirect

  // Group items by part of day
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.part_of_day]) {
      acc[item.part_of_day] = [];
    }
    acc[item.part_of_day].push(item);
    return acc;
  }, {} as Record<string, RoutineItem[]>);

  const partsOfDay = ['morning', 'afternoon', 'evening'] as const;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {itemsError && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              {itemsError}
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No items for today. Add some in the Edit tab!
            </div>
          ) : (
            partsOfDay.map(part => (
              <div key={part} className="space-y-2">
                <h2 className="text-lg font-semibold capitalize">{part}</h2>
                <div className="space-y-2">
                  {groupedItems[part]?.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onToggle={toggleItem}
                    />
                  ))}
                  {!groupedItems[part]?.length && (
                    <div className="text-center text-gray-500 py-2">
                      No {part} items
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
