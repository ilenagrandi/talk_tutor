import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store/useStore';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const AUTH_URL = 'https://auth.emergentagent.com/';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, sessionToken, setUser, setSessionToken, logout: storeLogout } = useStore();
  
  const isAuthenticated = !!user && !!sessionToken;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check for stored session token
      const storedToken = await AsyncStorage.getItem('session_token');
      
      if (storedToken) {
        // Verify session with backend
        try {
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          
          setUser(response.data);
          setSessionToken(storedToken);
        } catch (error) {
          // Session invalid, clear it
          await AsyncStorage.removeItem('session_token');
          setUser(null);
          setSessionToken(null);
        }
      }
      
      // Check for session_id in URL (cold start after auth redirect)
      if (Platform.OS === 'web') {
        const hash = window.location.hash;
        if (hash.includes('session_id=')) {
          await processSessionId(hash);
        }
      } else {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && initialUrl.includes('session_id=')) {
          await processSessionId(initialUrl);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processSessionId = async (url: string) => {
    try {
      // Extract session_id from URL
      const match = url.match(/session_id=([^&]+)/);
      if (!match) return;
      
      const sessionId = match[1];
      
      // Exchange session_id for session_token
      const response = await axios.post(
        `${API_URL}/api/auth/session`,
        {},
        {
          headers: { 'X-Session-ID': sessionId }
        }
      );
      
      const { user_id, email, name, picture, session_token } = response.data;
      
      // Save user and session
      setUser({ user_id, email, name, picture });
      await setSessionToken(session_token);
      
      // Clean URL
      if (Platform.OS === 'web') {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (error) {
      console.error('Session exchange error:', error);
    }
  };

  const login = async () => {
    try {
      const redirectUrl = Platform.OS === 'web'
        ? `${API_URL}/`
        : Linking.createURL('/');
      
      const authUrl = `${AUTH_URL}?redirect=${encodeURIComponent(redirectUrl)}`;
      
      if (Platform.OS === 'web') {
        window.location.href = authUrl;
      } else {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          await processSessionId(result.url);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        try {
          await axios.post(
            `${API_URL}/api/auth/logout`,
            {},
            {
              headers: { Authorization: `Bearer ${sessionToken}` }
            }
          );
        } catch (error) {
          console.error('Backend logout error:', error);
          // Continue with local logout even if backend fails
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      setUser(null);
      setSessionToken(null);
      await storeLogout();
    }
  };

  const checkSession = async () => {
    if (!sessionToken) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      setUser(response.data);
    } catch (error) {
      // Session expired
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
