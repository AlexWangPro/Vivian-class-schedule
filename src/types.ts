export interface AppEvent {
  id: string;
  title: string;
  emoji: string;
  color: string;
  start: string; // ISO string
  end: string; // ISO string
  isRecurring: boolean;
  recurrenceFrequency?: 'daily' | 'weekly' | 'monthly';
  recurrenceEndDate?: string; // ISO string
  notifyMe: boolean;
}

export type ViewMode = 'day' | 'week' | 'month';
