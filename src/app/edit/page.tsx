'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@/hooks/useUser';
import AuthGuard from '@/components/AuthGuard';
import { createItem, updateManyItemsOrder } from '@/services/items';
import { useItems } from '@/hooks/useItems';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { ItemForm } from '@/components/ItemForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DndContext, DragEndEvent, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { DraggableItem } from '@/components/DraggableItem';
import { Pencil, Trash2 } from 'lucide-react';
import { ExtendedRoutineItem } from '@/types/items';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayOfWeek = typeof DAYS_OF_WEEK[number];
type PartOfDay = 'morning' | 'afternoon' | 'evening';

type GroupedItems = {
  [key in DayOfWeek]: {
    [key in PartOfDay]: ExtendedRoutineItem[];
  };
};

export default function EditPage() {
  const { user } = useUser();
  const { items: rawItems, loading: itemsLoading } = useItems(user?.uid || '', true);
  const [name, setName] = useState('');
  const [partOfDay, setPartOfDay] = useState<PartOfDay[]>(['morning']);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([...DAYS_OF_WEEK]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPartOfDay, setEditPartOfDay] = useState<PartOfDay[]>(['morning']);
  const [editDays, setEditDays] = useState<DayOfWeek[]>([...DAYS_OF_WEEK]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Cast items to ExtendedRoutineItem[] to ensure proper typing
  const items = useMemo(() => rawItems as ExtendedRoutineItem[], [rawItems]);

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

    // Sort all items by order first
    const sortedItems = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    sortedItems.forEach(item => {
      item.day_of_week.forEach(day => {
        const parts = Array.isArray(item.part_of_day)
          ? item.part_of_day
          : typeof item.part_of_day === 'string'
            ? [item.part_of_day]
            : [];
        parts.forEach(part => {
          grouped[day][part].push(item);
        });
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
      
      // Calculate the next order number
      const nextOrder = items.length;
      
      const result = await createItem({
        name,
        part_of_day: partOfDay,
        day_of_week: selectedDays,
        order: nextOrder, // Set the order to be the next number
        user_id: user.uid
      });

      if (!result) {
        throw new Error('Failed to create item');
      }

      // Reset form
      setName('');
      setPartOfDay(['morning']);
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeItem = items.find(item => item.id === active.id);
    const overItem = items.find(item => item.id === over.id);
    
    if (!activeItem || !overItem || !user) return;

    // Get the current part of day items
    const partItems = items.filter(item => 
      item.part_of_day.some(part => overItem.part_of_day.includes(part)) &&
      item.day_of_week.some(day => overItem.day_of_week.includes(day))
    ).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Find indices in the part-specific array
    const oldIndex = partItems.findIndex(item => item.id === active.id);
    const newIndex = partItems.findIndex(item => item.id === over.id);

    // Create new array with updated order
    const newItems = arrayMove(partItems, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index
    }));

    try {
      await updateManyItemsOrder(user.uid, newItems);
      
      // Update local state
      const updatedItems = items.map(item => {
        const updatedItem = newItems.find(newItem => newItem.id === item.id);
        return updatedItem || item;
      });
      items.splice(0, items.length, ...updatedItems);
    } catch (err) {
      console.error('Error updating item order:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item order');
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
                                  <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                  >
                                    <SortableContext
                                      items={partItems.map(item => item.id)}
                                      strategy={verticalListSortingStrategy}
                                    >
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
                                              <DraggableItem
                                                item={item}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                isSubmitting={isSubmitting}
                                              />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </SortableContext>
                                  </DndContext>
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