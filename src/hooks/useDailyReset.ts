import { useEffect, useState, useRef } from 'react';
import { getUserSettings } from '@/services/settings';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useItems } from '@/hooks/useItems';

const LAST_RESET_KEY = 'routineo_last_reset';

interface UseDailyResetProps {
  userId: string;
  onReset?: () => void;
}

export function useDailyReset({ userId, onReset }: UseDailyResetProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasCheckedRef = useRef(false);
  const { items, loading, error: itemsError } = useItems(userId, true);

  useEffect(() => {
    // Skip if we've already checked or no user
    if (hasCheckedRef.current || !userId) {
      setIsChecking(false);
      return;
    }

    const checkAndReset = async () => {
      try {
        // Quick check of localStorage first
        const lastResetStr = localStorage.getItem(LAST_RESET_KEY);
        if (lastResetStr) {
          const lastReset = new Date(lastResetStr);
          const today = new Date();
          const lastResetDate = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate());
          const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          if (lastResetDate.getTime() === todayDate.getTime()) {
            console.log('Already reset today, skipping check');
            hasCheckedRef.current = true;
            setIsChecking(false);
            return;
          }
        }

        // Get user's reset time setting
        const settings = await getUserSettings(userId);
        if (!settings?.reset_time) {
          console.log('No reset time set');
          hasCheckedRef.current = true;
          setIsChecking(false);
          return;
        }

        // Parse reset time
        const [resetHour, resetMinute] = settings.reset_time.split(':').map(Number);
        const now = new Date();
        const resetTime = new Date(now);
        resetTime.setHours(resetHour, resetMinute, 0, 0);

        // Get last reset from localStorage
        const lastReset = lastResetStr ? new Date(lastResetStr) : null;
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastResetDate = lastReset ? new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate()) : null;

        // Check if reset is needed
        const needsReset = !lastReset || 
          (now >= resetTime && (!lastResetDate || lastResetDate.getTime() < today.getTime()));

        if (needsReset) {
          console.log('Reset needed, performing reset...');
          
          // Get today's items
          const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });
          const itemsQuery = query(
            collection(db, 'items'),
            where('user_id', '==', userId),
            where('day_of_week', 'array-contains', todayName)
          );
          
          const snapshot = await getDocs(itemsQuery);
          
          if (snapshot.empty) {
            console.log('No items to reset');
            localStorage.setItem(LAST_RESET_KEY, now.toISOString());
            hasCheckedRef.current = true;
            setIsChecking(false);
            return;
          }
          
          // Reset all items in a batch
          const batch = writeBatch(db);
          snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { is_checked: false });
          });
          
          await batch.commit();
          
          // Update last reset time
          localStorage.setItem(LAST_RESET_KEY, now.toISOString());
          
          // Notify parent component
          onReset?.();
          
          console.log('Reset completed successfully');
        } else {
          console.log('No reset needed');
        }
      } catch (err) {
        console.error('Error during reset check:', err);
        setError(err instanceof Error ? err.message : 'Failed to check reset status');
      } finally {
        hasCheckedRef.current = true;
        setIsChecking(false);
      }
    };

    checkAndReset();
  }, [userId, onReset]);

  return { isChecking, error };
} 