'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { RoutineItem } from '@/components/ItemCard';

export function useItems(userId: string) {
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const itemsQuery = query(
      collection(db, 'items'),
      where('user_id', '==', userId),
      where('day_of_week', 'array-contains', today)
    );

    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const itemsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RoutineItem[];
        setItems(itemsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching items:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

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