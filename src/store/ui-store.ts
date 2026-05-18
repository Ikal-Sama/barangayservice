import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Sidebar / UI state ────────────────────────────────────────────────────────

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// ── Alert / Notification cache (resident portal) ──────────────────────────────

export type CachedAlert = {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  isRead: boolean;
};

interface AlertStore {
  alerts: CachedAlert[];
  unreadCount: number;
  setAlerts: (alerts: CachedAlert[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useAlertStore = create<AlertStore>()(
  persist(
    (set, get) => ({
      alerts: [],
      unreadCount: 0,

      setAlerts: (alerts) => {
        const existing = get().alerts;
        // Preserve read-state for alerts already seen
        const merged = alerts.map((a) => {
          const prev = existing.find((e) => e.id === a.id);
          return prev ? { ...a, isRead: prev.isRead } : a;
        });
        set({
          alerts: merged,
          unreadCount: merged.filter((a) => !a.isRead).length,
        });
      },

      markRead: (id) =>
        set((s) => {
          const updated = s.alerts.map((a) =>
            a.id === id ? { ...a, isRead: true } : a
          );
          return { alerts: updated, unreadCount: updated.filter((a) => !a.isRead).length };
        }),

      markAllRead: () =>
        set((s) => ({
          alerts: s.alerts.map((a) => ({ ...a, isRead: true })),
          unreadCount: 0,
        })),
    }),
    { name: "barangaylink-alerts" }
  )
);

// ── Waste status optimistic cache ─────────────────────────────────────────────

export type OptimisticWasteEntry = {
  scheduleId: string;
  status: string;
  purokName: string;
};

interface WasteStore {
  optimisticStatuses: Record<string, string>;
  setOptimistic: (scheduleId: string, status: string) => void;
  clearOptimistic: (scheduleId: string) => void;
}

export const useWasteStore = create<WasteStore>()((set) => ({
  optimisticStatuses: {},
  setOptimistic: (scheduleId, status) =>
    set((s) => ({
      optimisticStatuses: { ...s.optimisticStatuses, [scheduleId]: status },
    })),
  clearOptimistic: (scheduleId) =>
    set((s) => {
      const next = { ...s.optimisticStatuses };
      delete next[scheduleId];
      return { optimisticStatuses: next };
    }),
}));
