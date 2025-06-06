import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

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

interface DraggableItemProps {
  item: ExtendedRoutineItem;
  onEdit: (item: ExtendedRoutineItem) => void;
  onDelete: (id: string) => void;
  isSubmitting?: boolean;
}

export function DraggableItem({ item, onEdit, onDelete, isSubmitting }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center gap-3">
        <button
          className="p-2 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-6 w-6 text-gray-400" />
        </button>
        <div className="flex-1">
          <div className="font-medium">{item.name}</div>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          disabled={isSubmitting}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          disabled={isSubmitting}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 