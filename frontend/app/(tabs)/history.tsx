import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { getUserHistory } from '../../services/api';

interface Analysis {
  _id: string;
  type: 'text' | 'image';
  tone: string;
  goal: string;
  created_at: string;
  has_image?: boolean;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useStore();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (!user) return;

    try {
      const response = await getUserHistory(user.id);
      setAnalyses(response.analyses || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSubtitle}>Your past analyses</Text>
      </View>

      <ScrollView style={styles.content}>
        {analyses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No analyses yet</Text>
            <Text style={styles.emptySubtext}>
              Start by analyzing your first conversation!
            </Text>
          </View>
        ) : (
          analyses.map((analysis) => (
            <TouchableOpacity
              key={analysis._id}
              style={styles.analysisCard}
              onPress={() => router.push(`/results?analysisId=${analysis._id}`)}
            >
              <View style={styles.analysisIcon}>
                <Ionicons
                  name={analysis.type === 'image' ? 'image' : 'chatbubble-ellipses'}
                  size={24}
                  color="#6366f1"
                />
              </View>
              <View style={styles.analysisContent}>
                <Text style={styles.analysisTitle}>
                  {analysis.tone.charAt(0).toUpperCase() + analysis.tone.slice(1)} •{' '}
                  {analysis.goal.charAt(0).toUpperCase() + analysis.goal.slice(1)}
                </Text>
                <Text style={styles.analysisDate}>{formatDate(analysis.created_at)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))
        )}
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#d1d5db',
    marginTop: 8,
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  analysisIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  analysisContent: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  analysisDate: {
    fontSize: 14,
    color: '#6b7280',
  },
});
