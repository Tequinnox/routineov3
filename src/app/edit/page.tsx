'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import AuthGuard from '@/components/AuthGuard';
import { createItem } from '@/services/items';
import { useItems } from '@/hooks/useItems';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayOfWeek = typeof DAYS_OF_WEEK[number];

// Extend the RoutineItem type to include day_of_week
type ExtendedRoutineItem = {
  id: string;
  name: string;
  part_of_day: 'morning' | 'afternoon' | 'evening';
  is_checked: boolean;
  day_of_week: DayOfWeek[];
};

// Separate form component to prevent re-renders
const ItemForm = ({ 
  name, 
  setName, 
  partOfDay, 
  setPartOfDay, 
  days, 
  setDays, 
  onSubmit, 
  submitText 
}: { 
  name: string;
  setName: (name: string) => void;
  partOfDay: 'morning' | 'afternoon' | 'evening';
  setPartOfDay: (part: 'morning' | 'afternoon' | 'evening') => void;
  days: DayOfWeek[];
  setDays: (days: DayOfWeek[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
}) => {
  const toggleDay = useCallback((day: DayOfWeek) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day].sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)));
    }
  }, [days, setDays]);

  return (
    <form onSubmit={onSubmit} className="flex gap-2 items-center">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="flex-1 rounded-md border border-gray-300 px-3 py-2"
        placeholder="Item name"
      />
      <select
        value={partOfDay}
        onChange={(e) => setPartOfDay(e.target.value as 'morning' | 'afternoon' | 'evening')}
        className="w-32 rounded-md border border-gray-300 px-2 py-2"
      >
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="evening">Evening</option>
      </select>
      <div className="flex gap-1">
        {DAYS_OF_WEEK.map(day => (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(day)}
            className={`px-2 py-1 text-xs rounded ${
              days.includes(day) 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 whitespace-nowrap"
      >
        {submitText}
      </button>
    </form>
  );
};

export default function EditPage() {
  const { user } = useUser();
  const { items, loading: itemsLoading } = useItems(user?.uid || '', true);
  const [name, setName] = useState('');
  const [partOfDay, setPartOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([...DAYS_OF_WEEK]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPartOfDay, setEditPartOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [editDays, setEditDays] = useState<DayOfWeek[]>([...DAYS_OF_WEEK]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      const result = await createItem({
        name,
        part_of_day: partOfDay,
        day_of_week: selectedDays,
        order: 0,
        user_id: user.uid
      });

      if (!result) {
        throw new Error('Failed to create item');
      }

      // Reset form
      setName('');
      setPartOfDay('morning');
      setSelectedDays([...DAYS_OF_WEEK]);
    } catch (err) {
      console.error('Error creating item:', err);
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: ExtendedRoutineItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPartOfDay(item.part_of_day);
    setEditDays(item.day_of_week);
  };

  const handleSave = async (itemId: string) => {
    if (!user || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      const itemRef = doc(db, 'items', itemId);
      await updateDoc(itemRef, {
        name: editName,
        part_of_day: editPartOfDay,
        day_of_week: editDays
      });
      setEditingId(null);
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!user || isSubmitting) return;
    
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      await deleteDoc(doc(db, 'items', itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (itemsLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-3xl mx-auto">Loading...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl font-semibold mb-4">Add Routine Item</h1>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <ItemForm
              name={name}
              setName={setName}
              partOfDay={partOfDay}
              setPartOfDay={setPartOfDay}
              days={selectedDays}
              setDays={setSelectedDays}
              onSubmit={handleSubmit}
              submitText={isSubmitting ? "Adding..." : "Add Item"}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Your Routine Items</h2>
            <div className="space-y-2">
              {(items as ExtendedRoutineItem[]).map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg border">
                  {editingId === item.id ? (
                    <ItemForm
                      name={editName}
                      setName={setEditName}
                      partOfDay={editPartOfDay}
                      setPartOfDay={setEditPartOfDay}
                      days={editDays}
                      setDays={setEditDays}
                      onSubmit={(e) => { e.preventDefault(); handleSave(item.id); }}
                      submitText={isSubmitting ? "Saving..." : "Save"}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{item.part_of_day}</div>
                        <div className="flex gap-1">
                          {item.day_of_week.map((day: DayOfWeek) => (
                            <span key={day} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {day.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          disabled={isSubmitting}
                          className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={isSubmitting}
                          className="text-red-500 hover:text-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No items yet. Add your first routine item above!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 