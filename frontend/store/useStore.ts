import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  subscription_plan?: string;
  subscription_expires?: string;
}

interface AppState {
  user: User | null;
  sessionToken: string | null;
  isDarkMode: boolean;
  hasCompletedOnboarding: boolean;
  language: string;
  setUser: (user: User | null) => void;
  setSessionToken: (token: string | null) => void;
  toggleDarkMode: () => void;
  completeOnboarding: () => void;
  setLanguage: (lang: string) => void;
  logout: () => void;
  initializeLanguage: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  sessionToken: null,
  isDarkMode: false,
  hasCompletedOnboarding: false,
  language: 'en',
  
  setUser: (user) => set({ user }),
  
  setSessionToken: async (token) => {
    set({ sessionToken: token });
    if (token) {
      await AsyncStorage.setItem('session_token', token);
    } else {
      await AsyncStorage.removeItem('session_token');
    }
  },
  
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  completeOnboarding: async () => {
    set({ hasCompletedOnboarding: true });
    await AsyncStorage.setItem('onboarding_completed', 'true');
  },
  
  setLanguage: async (lang) => {
    set({ language: lang });
    await AsyncStorage.setItem('app_language', lang);
  },
  
  logout: async () => {
    set({ user: null, sessionToken: null });
    await AsyncStorage.removeItem('session_token');
  },
  
  initializeLanguage: async () => {
    try {
      // Check if user has manually set a language
      const savedLang = await AsyncStorage.getItem('app_language');
      if (savedLang) {
        set({ language: savedLang });
      } else {
        // Use device locale
        const deviceLocale = Localization.locale;
        const lang = deviceLocale.startsWith('es') ? 'es' : 'en';
        set({ language: lang });
      }
    } catch (error) {
      console.error('Error initializing language:', error);
      set({ language: 'en' });
    }
  }
}));
