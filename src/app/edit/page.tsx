'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@/hooks/useUser';
import AuthGuard from '@/components/AuthGuard';
import { createItem } from '@/services/items';
import { useItems } from '@/hooks/useItems';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { ItemForm } from '@/components/ItemForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Pencil, Trash2 } from 'lucide-react';

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

type GroupedItems = {
  [key in DayOfWeek]: {
    morning: ExtendedRoutineItem[];
    afternoon: ExtendedRoutineItem[];
    evening: ExtendedRoutineItem[];
  };
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

  // Group items by day and part of day
  const groupedItems = useMemo(() => {
    const grouped: GroupedItems = DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: {
        morning: [],
        afternoon: [],
        evening: []
      }
    }), {} as GroupedItems);

    (items as ExtendedRoutineItem[]).forEach(item => {
      item.day_of_week.forEach(day => {
        grouped[day][item.part_of_day].push(item);
      });
    });

    return grouped;
  }, [items]);

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
        <div className="min-h-screen bg-gray-50 pt-16 px-4">
          <div className="max-w-md mx-auto flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 pt-16 px-4">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Routine</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
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
                submitText="Add Item"
                isSubmitting={isSubmitting}
                defaultOpen={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Routine Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-4">
                {DAYS_OF_WEEK.map(day => {
                  const dayItems = groupedItems[day];
                  const hasItems = dayItems.morning.length > 0 || 
                                 dayItems.afternoon.length > 0 || 
                                 dayItems.evening.length > 0;

                  if (!hasItems) return null;

                  return (
                    <AccordionItem key={day} value={day}>
                      <AccordionTrigger className="text-lg font-semibold">
                        {day}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          {['morning', 'afternoon', 'evening'].map(part => {
                            const partItems = dayItems[part as keyof typeof dayItems];
                            if (partItems.length === 0) return null;

                            return (
                              <AccordionItem key={`${day}-${part}`} value={`${day}-${part}`}>
                                <AccordionTrigger className="text-base font-medium capitalize">
                                  {part} ({partItems.length})
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2 pt-2">
                                    {partItems.map((item) => (
                                      <div key={item.id}>
                                        {editingId === item.id ? (
                                          <ItemForm
                                            name={editName}
                                            setName={setEditName}
                                            partOfDay={editPartOfDay}
                                            setPartOfDay={setEditPartOfDay}
                                            days={editDays}
                                            setDays={setEditDays}
                                            onSubmit={(e) => { e.preventDefault(); handleSave(item.id); }}
                                            submitText="Save"
                                            isSubmitting={isSubmitting}
                                            defaultOpen={true}
                                          />
                                        ) : (
                                          <div className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                                            <div className="flex-1">
                                              <div className="font-medium">{item.name}</div>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {item.day_of_week.map((d) => (
                                                  <span key={d} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                    {d.slice(0, 3)}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(item)}
                                                disabled={isSubmitting}
                                              >
                                                <Pencil className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={isSubmitting}
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              {items.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  No items yet. Add your first routine item above!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
} 