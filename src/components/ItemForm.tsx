'use client';

import { useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from "lucide-react";

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayOfWeek = typeof DAYS_OF_WEEK[number];

type PartOfDay = 'morning' | 'afternoon' | 'evening';
const PARTS_OF_DAY: PartOfDay[] = ['morning', 'afternoon', 'evening'];

interface ItemFormProps {
  name: string;
  setName: (name: string) => void;
  partOfDay: PartOfDay[];
  setPartOfDay: (parts: PartOfDay[]) => void;
  days: DayOfWeek[];
  setDays: (days: DayOfWeek[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  isSubmitting?: boolean;
  defaultOpen?: boolean;
}

export function ItemForm({
  name,
  setName,
  partOfDay,
  setPartOfDay,
  days,
  setDays,
  onSubmit,
  submitText,
  isSubmitting = false,
  defaultOpen = true,
}: ItemFormProps) {
  const toggleDay = useCallback((day: DayOfWeek) => {
    if (days.includes(day)) {
      setDays(days.filter(d => d !== day));
    } else {
      setDays([...days, day].sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)));
    }
  }, [days, setDays]);

  const toggleAllDays = useCallback(() => {
    if (days.length === DAYS_OF_WEEK.length) {
      setDays([]);
    } else {
      setDays([...DAYS_OF_WEEK]);
    }
  }, [days, setDays]);

  const togglePartOfDay = useCallback((part: PartOfDay) => {
    if (partOfDay.includes(part)) {
      setPartOfDay(partOfDay.filter(p => p !== part));
    } else {
      setPartOfDay([...partOfDay, part].sort((a, b) => PARTS_OF_DAY.indexOf(a) - PARTS_OF_DAY.indexOf(b)));
    }
  }, [partOfDay, setPartOfDay]);

  // Split days into two rows of 4
  const firstRowDays = DAYS_OF_WEEK.slice(0, 4);
  const secondRowDays = DAYS_OF_WEEK.slice(4);

  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? "form" : undefined}>
      <AccordionItem value="form">
        <AccordionTrigger className="text-lg font-semibold">
          {submitText === "Add Item" ? "Add New Routine Item" : "Edit Routine Item"}
        </AccordionTrigger>
        <AccordionContent>
          <form onSubmit={onSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter item name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Parts of Day</Label>
              <div className="grid grid-cols-3 gap-2">
                {PARTS_OF_DAY.map(part => (
                  <Button
                    key={part}
                    type="button"
                    variant={partOfDay.includes(part) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePartOfDay(part)}
                    disabled={isSubmitting}
                    className="h-9 capitalize"
                  >
                    {part}
                    {partOfDay.includes(part) && (
                      <Check className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Days of Week</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleAllDays}
                  disabled={isSubmitting}
                  className="h-7 px-2 text-xs"
                >
                  {days.length === DAYS_OF_WEEK.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {firstRowDays.map(day => (
                  <Button
                    key={day}
                    type="button"
                    variant={days.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day)}
                    disabled={isSubmitting}
                    className="h-7 text-xs"
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {secondRowDays.map(day => (
                  <Button
                    key={day}
                    type="button"
                    variant={days.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(day)}
                    disabled={isSubmitting}
                    className="h-7 text-xs"
                  >
                    {day.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Submitting...</span>
                </div>
              ) : (
                submitText
              )}
            </Button>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 