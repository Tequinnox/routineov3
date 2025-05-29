'use client';

import { useEffect, useMemo } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { useItems } from '@/hooks/useItems';
import { ItemCard, type RoutineItem } from '@/components/ItemCard';
import AuthGuard from '@/components/AuthGuard';
import { useDailyReset } from '@/hooks/useDailyReset';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from '@/components/Quote';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
type PartOfDay = 'morning' | 'afternoon' | 'evening';

interface ExtendedRoutineItem {
  id: string;
  name: string;
  part_of_day: PartOfDay[];
  is_checked: boolean;
  day_of_week: DayOfWeek[];
  order?: number;
  user_id: string;
}

const PARTS_OF_DAY: PartOfDay[] = ['morning', 'afternoon', 'evening'];

export default function Home() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { items: rawItems, loading: itemsLoading, error: itemsError, toggleItem } = useItems(user?.uid || '');
  const { isChecking: isResetting } = useDailyReset({ userId: user?.uid || '' });

  // Cast items to ExtendedRoutineItem[] and sort by order
  const items = useMemo(() => {
    const typedItems = rawItems as ExtendedRoutineItem[];
    return [...typedItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [rawItems]);

  // Group items by part of day
  const groupedItems = useMemo(() => {
    const grouped = {
      morning: [] as ExtendedRoutineItem[],
      afternoon: [] as ExtendedRoutineItem[],
      evening: [] as ExtendedRoutineItem[]
    };

    // First sort all items by order
    const sortedItems = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    sortedItems.forEach(item => {
      const parts = Array.isArray(item.part_of_day)
        ? item.part_of_day
        : typeof item.part_of_day === 'string'
          ? [item.part_of_day]
          : [];
      
      parts.forEach(part => {
        if (part in grouped) {
          // Only add to the group if it's not already there
          // This ensures items appear in the correct order within each group
          if (!grouped[part as keyof typeof grouped].some(existing => existing.id === item.id)) {
            grouped[part as keyof typeof grouped].push(item);
          }
        }
      });
    });

    return grouped;
  }, [items]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  if (loading || itemsLoading || isResetting) {
    return (
      <div className="min-h-screen bg-gray-50 px-4">
        <div className="max-w-md mx-auto flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null; // Will redirect

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 px-4">
        <div className="max-w-md mx-auto space-y-6 pt-[calc(3rem+env(safe-area-inset-top))]">
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
              {PARTS_OF_DAY.map(part => (
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

          <Quote />
        </div>
      </div>
    </AuthGuard>
  );
}
