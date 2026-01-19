import { create } from 'zustand';

interface User {
  id: string;
  isSubscribed: boolean;
  hasCompletedOnboarding: boolean;
}

interface AppState {
  user: User | null;
  setUser: (user: User) => void;
  updateSubscriptionStatus: (isSubscribed: boolean) => void;
  completeOnboarding: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: {
    id: 'user_' + Date.now(),
    isSubscribed: false,
    hasCompletedOnboarding: false,
  },
  setUser: (user) => set({ user }),
  updateSubscriptionStatus: (isSubscribed) =>
    set((state) => ({
      user: state.user ? { ...state.user, isSubscribed } : null,
    })),
  completeOnboarding: () =>
    set((state) => ({
      user: state.user ? { ...state.user, hasCompletedOnboarding: true } : null,
    })),
}));
