'use client';

import { useUser } from '@/hooks/useUser';
import { useItems } from '@/hooks/useItems';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createItem } from '@/services/items';
import { useRouter } from 'next/navigation';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayOfWeek = typeof DAYS_OF_WEEK[number];

export default function Header() {
  const { user, loading } = useUser();
  const { items } = useItems(user?.uid || '');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Don't render anything if not authenticated or still loading
  if (!user || loading) return null;
  
  const remaining = items?.filter(item => !item.is_checked).length || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting || !name.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      // Get current day
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
      
      // Calculate the next order number by finding the highest order in today's morning items
      const todayMorningItems = items.filter(item => 
        item.day_of_week.includes(today) && 
        item.part_of_day.includes('morning')
      );
      const nextOrder = todayMorningItems.length > 0 
        ? Math.max(...todayMorningItems.map(item => item.order ?? 0)) + 1
        : 0;
      
      await createItem({
        name: name.trim(),
        part_of_day: ['morning'], // Default to morning
        day_of_week: [today], // Only add for today
        order: nextOrder,
        user_id: user.uid
      });

      // Reset and close
      setName('');
      setIsOpen(false);
      
      // Refresh the page to show new item
      router.refresh();
    } catch (err) {
      console.error('Error creating item:', err);
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header 
        className="fixed w-full bg-neutral-900 z-50"
        style={{ 
          top: 'env(safe-area-inset-top)',
          height: 'calc(3rem + env(safe-area-inset-top))'
        }}
      >
        <div className="px-4 h-full flex items-center justify-between">
          <span className="rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground">
            {remaining} left
          </span>
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-full bg-accent p-1.5 text-accent-foreground hover:bg-accent/90 transition-colors"
            aria-label="Quick add item"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </header>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Add Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter item name"
                required
                disabled={isSubmitting}
                autoFocus
              />
              <p className="text-sm text-gray-500">
                This will add an item for today only, in the morning section.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Adding...</span>
                </div>
              ) : (
                'Add Item'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 