import { db } from '@/lib/firebaseClient';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { ExtendedRoutineItem } from '@/types/items';

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

export async function updateManyItemsOrder(userId: string, items: ExtendedRoutineItem[]): Promise<void> {
  const batch = writeBatch(db);
  
  items.forEach((item, index) => {
    if (item.user_id !== userId) {
      throw new Error('Cannot update items belonging to another user');
    }
    const itemRef = doc(db, 'items', item.id);
    batch.update(itemRef, { order: index });
  });

  await batch.commit();
} 