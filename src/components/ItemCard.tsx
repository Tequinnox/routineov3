'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PartOfDay = 'morning' | 'afternoon' | 'evening';

export type RoutineItem = {
  id: string;
  name: string;
  part_of_day: PartOfDay[];
  is_checked: boolean;
};

interface ItemCardProps {
  item: RoutineItem;
  onToggle: (id: string, checked: boolean) => void;
}

export function ItemCard({ item, onToggle }: ItemCardProps) {
  return (
    <Card className={cn(
      "p-4 transition-colors",
      item.is_checked && "bg-gray-50"
    )}>
      <div className="flex items-center gap-3">
        <Checkbox
          id={item.id}
          checked={item.is_checked}
          onCheckedChange={(checked) => onToggle(item.id, checked as boolean)}
          className="h-5 w-5 rounded-md border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          aria-label={`Mark ${item.name} as ${item.is_checked ? 'incomplete' : 'complete'}`}
        />
        <label
          htmlFor={item.id}
          className={cn(
            "flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            item.is_checked && "text-gray-500 line-through"
          )}
        >
          {item.name}
        </label>
      </div>
    </Card>
  );
} 