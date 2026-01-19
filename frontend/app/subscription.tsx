import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../store/useStore';
import { getSubscriptionPlans, activateSubscription } from '../services/api';
import i18n from '../i18n';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, isDarkMode, language } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<string>('standard');
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [plans, setPlans] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  i18n.locale = language;
  
  const colors = {
    background: isDarkMode ? '#111827' : '#fff',
    card: isDarkMode ? '#1f2937' : '#fff',
    text: isDarkMode ? '#f9fafb' : '#1f2937',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    primary: '#6366f1',
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await getSubscriptionPlans();
      setPlans(response.plans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;

    setIsProcessing(true);

    try {
      await activateSubscription(selectedPlan, selectedPeriod);

      Alert.alert(
        i18n.t('success'),
        'Your subscription has been activated (mock). In production, this would process payment through RevenueCat.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(i18n.t('error'), error.message || 'Failed to process subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const plansList = [
    { id: 'standard', name: 'Standard', color: '#6366f1' },
    { id: 'premium', name: 'Premium', color: '#8b5cf6' },
    { id: 'pro', name: 'Pro', color: '#ec4899' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{i18n.t('subscription.title')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Ionicons name="star" size={64} color={colors.primary} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>{i18n.t('subscription.unlock')}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {i18n.t('subscription.subtitle')}
          </Text>
        </View>

        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              selectedPeriod === 'monthly' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text style={[
              styles.periodText,
              { color: selectedPeriod === 'monthly' ? '#fff' : colors.text }
            ]}>
              {i18n.t('subscription.monthly')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              selectedPeriod === 'annual' && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setSelectedPeriod('annual')}
          >
            <Text style={[
              styles.periodText,
              { color: selectedPeriod === 'annual' ? '#fff' : colors.text }
            ]}>
              {i18n.t('subscription.annual')}
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>{i18n.t('subscription.save')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.plansContainer}>
          {plansList.map((plan) => {
            const planData = plans?.[plan.id];
            if (!planData) return null;
            
            const price = selectedPeriod === 'monthly' 
              ? `$${planData.price_monthly}`
              : `$${planData.price_annual}`;
            
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedPlan === plan.id && { borderColor: plan.color, borderWidth: 3 }
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <View style={styles.planHeader}>
                  <View>
                    <Text style={[styles.planName, { color: colors.text }]}>{planData.name}</Text>
                    <View style={styles.planPricing}>
                      <Text style={[styles.planPrice, { color: colors.text }]}>{price}</Text>
                      <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
                        /{selectedPeriod === 'monthly' ? 'month' : 'year'}
                      </Text>
                    </View>
                  </View>
                  {selectedPlan === plan.id && (
                    <Ionicons name="checkmark-circle" size={32} color={plan.color} />
                  )}
                </View>

                <View style={styles.featuresContainer}>
                  {planData.features.map((feature: string, index: number) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: colors.primary }, isProcessing && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>
                {i18n.t('subscription.subscribeNow')}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          {i18n.t('subscription.disclaimer')}
        </Text>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  saveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  plansContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  planPeriod: {
    fontSize: 16,
    marginLeft: 4,
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  subscribeButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
});
