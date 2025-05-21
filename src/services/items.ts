import { db } from '@/lib/firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type PartOfDay = 'morning' | 'afternoon' | 'evening';

// Type for a routine item as specified in architecture.md
export interface RoutineItem {
  name: string;
  part_of_day: PartOfDay[];
  day_of_week: string[];
  order: number;
  is_checked: boolean;
  user_id: string;
}

// Create a new item
export async function createItem(item: Omit<RoutineItem, 'is_checked'>) {
  const itemsRef = collection(db, 'items');
  return addDoc(itemsRef, {
    ...item,
    is_checked: false,
    created_at: serverTimestamp()
  });
} 