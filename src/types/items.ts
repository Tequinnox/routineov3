export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type PartOfDay = 'morning' | 'afternoon' | 'evening';

export interface ExtendedRoutineItem {
  id: string;
  name: string;
  part_of_day: PartOfDay[];
  is_checked: boolean;
  day_of_week: DayOfWeek[];
  order?: number;
  user_id: string;
} 