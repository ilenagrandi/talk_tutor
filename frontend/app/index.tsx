import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../store/useStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { hasCompletedOnboarding } = useStore();

  useEffect(() => {
    if (!isLoading) {
      checkAndNavigate();
    }
  }, [isLoading, isAuthenticated]);

  const checkAndNavigate = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Splash delay
    
    if (!isAuthenticated) {
      // Check if onboarding was completed
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      if (!onboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/login');
      }
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>💬</Text>
        </View>
        <Text style={styles.title}>TalkTutor</Text>
        <Text style={styles.subtitle}>Master Every Conversation</Text>
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366f1',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 64,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  loader: {
    marginTop: 40,
  },
});
