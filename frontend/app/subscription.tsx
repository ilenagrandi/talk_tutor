import React, { useState } from 'react';
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
import { mockActivateSubscription } from '../services/api';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user, updateSubscriptionStatus } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$9.99',
      period: '/month',
      savings: null,
    },
    {
      id: 'annual',
      name: 'Annual',
      price: '$79.99',
      period: '/year',
      savings: 'Save 33%',
    },
  ];

  const features = [
    'Unlimited conversation analysis',
    'AI-powered response suggestions',
    'Image and text analysis',
    'All communication tones',
    'All goal types',
    'History & saved analyses',
    'Priority support',
  ];

  const handleSubscribe = async () => {
    if (!user) return;

    setIsProcessing(true);

    try {
      // Mock subscription activation
      await mockActivateSubscription(user.id);
      updateSubscriptionStatus(true);

      Alert.alert(
        'Success!',
        'Your subscription has been activated (mock). In production, this would process payment through RevenueCat.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>✨</Text>
          <Text style={styles.heroTitle}>Unlock Premium Features</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited AI-powered conversation coaching
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardActive,
              ]}
              onPress={() => setSelectedPlan(plan.id as 'monthly' | 'annual')}
            >
              {plan.savings && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{plan.savings}</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {selectedPlan === plan.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                )}
              </View>
              <View style={styles.planPricing}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What you get:</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, isProcessing && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>
                Subscribe Now
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By subscribing, you agree to our Terms of Service and Privacy Policy. Cancel anytime.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Note: This is a mock subscription for testing purposes. In production, this would integrate with RevenueCat for real payments through App Store and Google Play.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  plansContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  planCardActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  planPeriod: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
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
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  subscribeButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  footer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 18,
  },
});
