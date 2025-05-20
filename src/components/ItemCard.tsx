'use client';

export type RoutineItem = {
  id: string;
  name: string;
  part_of_day: 'morning' | 'afternoon' | 'evening';
  is_checked: boolean;
};

type ItemCardProps = {
  item: RoutineItem;
  onToggle: (id: string, checked: boolean) => void;
};

export function ItemCard({ item, onToggle }: ItemCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
      <input
        type="checkbox"
        checked={item.is_checked}
        onChange={(e) => onToggle(item.id, e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={`Mark ${item.name} as ${item.is_checked ? 'incomplete' : 'complete'}`}
      />
      <span className="flex-1">{item.name}</span>
      <span className="text-sm text-gray-500 capitalize">{item.part_of_day}</span>
    </div>
  );
} 