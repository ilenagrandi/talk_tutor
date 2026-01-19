import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../store/useStore';
import i18n from '../i18n';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const { isDarkMode, language } = useStore();
  
  i18n.locale = language;
  
  const colors = {
    background: isDarkMode ? '#111827' : '#fff',
    primary: '#6366f1',
    text: isDarkMode ? '#f9fafb' : '#1f2937',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {i18n.t('loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="chatbubble-ellipses" size={80} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{i18n.t('appName')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {i18n.t('appSubtitle')}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {i18n.t('auth.loginDescription')}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
          >
            <Ionicons name="log-in" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.loginButtonText}>{i18n.t('auth.getStartedFree')}</Text>
          </TouchableOpacity>

          <View style={styles.methodsContainer}>
            <Text style={[styles.methodsTitle, { color: colors.textSecondary }]}>
              {i18n.t('auth.loginWithGoogle')}
            </Text>
            <Text style={[styles.methodsTitle, { color: colors.textSecondary }]}>
              {i18n.t('auth.loginWithApple')}
            </Text>
            <Text style={[styles.methodsTitle, { color: colors.textSecondary }]}>
              {i18n.t('auth.loginWithEmail')}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 24,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  methodsContainer: {
    gap: 12,
    paddingHorizontal: 20,
  },
  methodsTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
