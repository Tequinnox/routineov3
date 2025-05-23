'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { ExtendedRoutineItem } from '@/types/items';

export function useItems(userId: string, showAllItems: boolean = false) {
  const [items, setItems] = useState<ExtendedRoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const itemsQuery = query(
      collection(db, 'items'),
      where('user_id', '==', userId),
      ...(showAllItems ? [] : [where('day_of_week', 'array-contains', today)])
    );

    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const itemsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ExtendedRoutineItem[];
        
        // Sort items by order, with undefined orders last
        const sortedItems = itemsData.sort((a, b) => {
          if (a.order === undefined && b.order === undefined) return 0;
          if (a.order === undefined) return 1;
          if (b.order === undefined) return -1;
          return a.order - b.order;
        });
        
        setItems(sortedItems);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching items:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, showAllItems]);

  const toggleItem = async (itemId: string, checked: boolean) => {
    try {
      const itemRef = doc(db, 'items', itemId);
      await updateDoc(itemRef, { is_checked: checked });
    } catch (err) {
      console.error('Error toggling item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  return { items, loading, error, toggleItem };
} 