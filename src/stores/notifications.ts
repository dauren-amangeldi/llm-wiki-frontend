import { create } from "zustand";

interface Notification {
  id: string;
  text: string;
  type: string;
  created_at: string;
  read: boolean;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  dropdownOpen: boolean;
  setNotifications: (n: Notification[]) => void;
  setUnreadCount: (c: number) => void;
  toggleDropdown: () => void;
  closeDropdown: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  dropdownOpen: false,
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  toggleDropdown: () => set((s) => ({ dropdownOpen: !s.dropdownOpen })),
  closeDropdown: () => set({ dropdownOpen: false }),
}));
