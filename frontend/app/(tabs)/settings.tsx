import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../context/AuthContext';
import i18n from '../../i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, isDarkMode, toggleDarkMode, language, setLanguage } = useStore();
  const { logout } = useAuth();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  
  i18n.locale = language;
  
  const colors = {
    background: isDarkMode ? '#111827' : '#f9fafb',
    card: isDarkMode ? '#1f2937' : '#fff',
    text: isDarkMode ? '#f9fafb' : '#1f2937',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    primary: '#6366f1',
    primaryLight: isDarkMode ? '#4f46e5' : '#eef2ff',
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const handleLogout = () => {
    Alert.alert(
      i18n.t('settings.logout'),
      'Are you sure you want to log out?',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('settings.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleSubscriptionManagement = () => {
    if (user?.subscription_plan) {
      Alert.alert(
        i18n.t('settings.subscription'),
        `Current plan: ${user.subscription_plan}. In production, this would open subscription management.`,
        [{ text: 'OK' }]
      );
    } else {
      router.push('/subscription');
    }
  };

  const handleLanguageChange = async (langCode: string) => {
    await setLanguage(langCode);
    setShowLanguagePicker(false);
    i18n.locale = langCode;
  };

  const getCurrentLanguageName = () => {
    const lang = languages.find(l => l.code === language);
    return lang ? `${lang.flag} ${lang.name}` : 'English';
  };

  const settingsOptions = [
    {
      section: i18n.t('settings.appearance'),
      items: [
        {
          icon: 'moon',
          label: i18n.t('settings.darkMode'),
          subtitle: isDarkMode ? i18n.t('settings.darkModeOn') : i18n.t('settings.darkModeOff'),
          onPress: () => {},
          hasSwitch: true,
        },
        {
          icon: 'language',
          label: i18n.t('settings.language'),
          subtitle: getCurrentLanguageName(),
          onPress: () => setShowLanguagePicker(true),
        },
      ],
    },
    {
      section: i18n.t('settings.account'),
      items: [
        {
          icon: 'person-circle',
          label: i18n.t('settings.profile'),
          subtitle: user?.email || i18n.t('settings.profileDesc'),
          onPress: () => Alert.alert(i18n.t('settings.profile'), `Logged in as: ${user?.email}`),
        },
        {
          icon: 'card',
          label: i18n.t('settings.subscription'),
          subtitle: user?.subscription_plan 
            ? `${user.subscription_plan.charAt(0).toUpperCase() + user.subscription_plan.slice(1)} plan`
            : i18n.t('settings.subscriptionInactive'),
          onPress: handleSubscriptionManagement,
          badge: user?.subscription_plan ? 'Premium' : null,
        },
        {
          icon: 'log-out',
          label: i18n.t('settings.logout'),
          subtitle: 'Sign out from your account',
          onPress: handleLogout,
          isDestructive: true,
        },
      ],
    },
    {
      section: i18n.t('settings.support'),
      items: [
        {
          icon: 'help-circle',
          label: i18n.t('settings.help'),
          subtitle: i18n.t('settings.helpDesc'),
          onPress: () => Alert.alert(i18n.t('settings.help'), 'Help center coming soon'),
        },
        {
          icon: 'mail',
          label: i18n.t('settings.contact'),
          subtitle: i18n.t('settings.contactDesc'),
          onPress: () => Alert.alert(i18n.t('settings.contact'), 'support@talktutor.app'),
        },
      ],
    },
    {
      section: i18n.t('settings.about'),
      items: [
        {
          icon: 'shield-checkmark',
          label: i18n.t('settings.privacy'),
          subtitle: i18n.t('settings.privacyDesc'),
          onPress: () => Alert.alert(i18n.t('settings.privacy'), 'View privacy policy'),
        },
        {
          icon: 'document-text',
          label: i18n.t('settings.terms'),
          subtitle: i18n.t('settings.termsDesc'),
          onPress: () => Alert.alert(i18n.t('settings.terms'), 'View terms of service'),
        },
        {
          icon: 'information-circle',
          label: i18n.t('settings.aboutApp'),
          subtitle: i18n.t('settings.version'),
          onPress: () => Alert.alert('TalkTutor', 'Your AI Communication Coach'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>Administra tus preferencias</Text>
      </View>

      <ScrollView style={styles.content}>
        {settingsOptions.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.section}</Text>
            {section.items.map((item: any, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={item.onPress}
                disabled={item.hasSwitch}
              >
                <View style={[styles.settingIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <View style={styles.settingHeader}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                </View>
                {item.hasSwitch ? (
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleDarkMode}
                    trackColor={{ false: '#d1d5db', true: colors.primary }}
                    thumbColor={'#fff'}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 24,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  badge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
