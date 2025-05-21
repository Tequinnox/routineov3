'use client';

import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useItems } from '@/hooks/useItems';
import { ItemCard, type RoutineItem } from '@/components/ItemCard';
import AuthGuard from '@/components/AuthGuard';
import { useDailyReset } from '@/hooks/useDailyReset';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      <div className="min-h-screen bg-gray-50 pt-16 px-4">
        <div className="max-w-md mx-auto flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
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
      <div className="min-h-screen bg-gray-50 pt-16 px-4">
        <div className="max-w-md mx-auto space-y-4">
          {itemsError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {itemsError}
            </div>
          )}

          {items.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="text-center text-gray-500 text-sm">
                  No items for today. Add some in the Edit tab!
                </div>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {partsOfDay.map(part => (
                <AccordionItem
                  key={part}
                  value={part}
                  className="bg-white rounded-lg border px-4"
                >
                  <AccordionTrigger className="py-3 text-base font-medium capitalize hover:no-underline">
                    <div className="flex items-center gap-2">
                      <span>{part}</span>
                      <span className="text-sm text-gray-500">
                        ({groupedItems[part]?.length || 0})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pb-3">
                    {groupedItems[part]?.map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onToggle={toggleItem}
                      />
                    ))}
                    {!groupedItems[part]?.length && (
                      <div className="text-center text-gray-500 text-sm py-2">
                        No {part} items
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
