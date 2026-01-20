import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export default function DevLoginScreen() {
  const router = useRouter();
  const { setUser, setSessionToken } = useStore();
  const [loading, setLoading] = useState(false);

  const createAndLoginTestUser = async () => {
    setLoading(true);
    try {
      console.log('Creating test user...');
      
      // Crear usuario de prueba con suscripción Pro
      const response = await axios.post(`${API_URL}/api/dev/create-test-user`);
      console.log('Response:', response.data);
      
      const { user_id, email, name, session_token, subscription_plan, subscription_expires } = response.data;

      // Guardar en store
      setUser({
        user_id,
        email,
        name,
        subscription_plan,
        subscription_expires,
      });

      await setSessionToken(session_token);
      
      console.log('User created and saved, redirecting...');

      // Redirigir directamente sin alert
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
      
    } catch (error: any) {
      console.error('Error creating test user:', error);
      Alert.alert('Error', error.response?.data?.detail || error.message || 'Failed to create test user');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#6366f1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Development Login</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={48} color="#f59e0b" />
          <Text style={styles.warningTitle}>Development Only</Text>
          <Text style={styles.warningText}>
            This screen is for testing purposes only. It creates a test user with full Pro subscription access.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What you'll get:</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.featureText}>Pro Plan subscription (1 year)</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.featureText}>Unlimited AI analysis</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.featureText}>5 suggestions per analysis</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.featureText}>All premium features unlocked</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={createAndLoginTestUser}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="flash" size={24} color="#fff" />
              <Text style={styles.buttonText}>Create Test User & Login</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: Each time you tap this button, a new test user will be created with a unique email.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400e',
    marginTop: 12,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});
