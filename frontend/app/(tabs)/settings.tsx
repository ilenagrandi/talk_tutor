import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateSubscriptionStatus } = useStore();

  const handleSubscriptionManagement = () => {
    if (user?.isSubscribed) {
      Alert.alert(
        'Subscription Active',
        'Your subscription is currently active. In production, this would open subscription management.',
        [{ text: 'OK' }]
      );
    } else {
      router.push('/subscription');
    }
  };

  const settingsOptions = [
    {
      section: 'Account',
      items: [
        {
          icon: 'person-circle',
          label: 'Profile',
          subtitle: 'Manage your account',
          onPress: () => Alert.alert('Coming Soon', 'Profile management coming soon'),
        },
        {
          icon: 'card',
          label: 'Subscription',
          subtitle: user?.isSubscribed ? 'Active subscription' : 'Get premium access',
          onPress: handleSubscriptionManagement,
          badge: user?.isSubscribed ? 'Premium' : null,
        },
      ],
    },
    {
      section: 'Support',
      items: [
        {
          icon: 'help-circle',
          label: 'Help & FAQ',
          subtitle: 'Get answers to your questions',
          onPress: () => Alert.alert('Help', 'Help center coming soon'),
        },
        {
          icon: 'mail',
          label: 'Contact Support',
          subtitle: 'We are here to help',
          onPress: () => Alert.alert('Contact', 'support@talktutor.app'),
        },
      ],
    },
    {
      section: 'About',
      items: [
        {
          icon: 'shield-checkmark',
          label: 'Privacy Policy',
          subtitle: 'How we protect your data',
          onPress: () => Alert.alert('Privacy', 'Privacy policy coming soon'),
        },
        {
          icon: 'document-text',
          label: 'Terms of Service',
          subtitle: 'Usage terms and conditions',
          onPress: () => Alert.alert('Terms', 'Terms of service coming soon'),
        },
        {
          icon: 'information-circle',
          label: 'About TalkTutor',
          subtitle: 'Version 1.0.0',
          onPress: () => Alert.alert('TalkTutor', 'Your AI Communication Coach'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your preferences</Text>
      </View>

      <ScrollView style={styles.content}>
        {settingsOptions.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.settingItem}
                onPress={item.onPress}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#6366f1" />
                </View>
                <View style={styles.settingContent}>
                  <View style={styles.settingHeader}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
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
