import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppEvent {
  id: string;
  title: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string;
  emoji: string;
  location?: string;
}

interface AppState {
  events: AppEvent[];
  theme: 'light' | 'dark';
  copiedEvent: Omit<AppEvent, 'id' | 'date'> | null;
  fetchEvents: () => Promise<void>;
  addEvent: (event: AppEvent) => void;
  updateEvent: (id: string, event: AppEvent) => void;
  deleteEvent: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCopiedEvent: (event: Omit<AppEvent, 'id' | 'date'> | null) => void;
}

const API_URL = import.meta.env.BASE_URL + 'api/events.php';

const syncEventsToServer = async (events: AppEvent[]) => {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(events)
    });
  } catch (e) {
    console.error('Failed to sync events:', e);
  }
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      events: [],
      theme: 'light',
      copiedEvent: null,
      fetchEvents: async () => {
        try {
          const res = await fetch(`${API_URL}?_t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          });
          if (res.ok) {
            const serverEvents = await res.json();
            // Important fix: if server returns empty array but we have local data,
            // DO NOT wipe the local data (this happens if PHP fails to save data.json)
            const localEvents = get().events;
            if (serverEvents.length === 0 && localEvents.length > 0) {
              // Try to push local to server again just in case, but keep local state
              syncEventsToServer(localEvents);
            } else if (JSON.stringify(localEvents) !== JSON.stringify(serverEvents)) {
              set({ events: serverEvents });
            }
          }
        } catch (e) {
          console.error('Failed to load events:', e);
        }
      },
      addEvent: (event) => {
        set((state) => {
          const newEvents = [...state.events, event];
          syncEventsToServer(newEvents);
          return { events: newEvents };
        });
      },
      updateEvent: (id, updatedEvent) => {
        set((state) => {
          const newEvents = state.events.map((e) => (e.id === id ? updatedEvent : e));
          syncEventsToServer(newEvents);
          return { events: newEvents };
        });
      },
      deleteEvent: (id) => {
        set((state) => {
          const newEvents = state.events.filter((e) => e.id !== id);
          syncEventsToServer(newEvents);
          return { events: newEvents };
        });
      },
      setTheme: (theme) => set({ theme }),
      setCopiedEvent: (event) => set({ copiedEvent: event }),
    }),
    {
      name: 'vivian-schedule-storage',
    }
  )
);
