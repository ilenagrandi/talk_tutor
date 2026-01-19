import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Clipboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAnalysisDetail } from '../services/api';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      if (params.analysisId) {
        const data = await getAnalysisDetail(params.analysisId as string);
        setAnalysis(data);
      } else if (params.suggestions && params.analysis) {
        setAnalysis({
          suggestions: JSON.parse(params.suggestions as string),
          analysis: params.analysis,
        });
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      Alert.alert('Error', 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const copySuggestion = (suggestion: string) => {
    Clipboard.setString(suggestion);
    Alert.alert('Copied!', 'Suggestion copied to clipboard');
  };

  const shareAnalysis = async () => {
    if (!analysis) return;

    try {
      const message = `TalkTutor Analysis\n\n${analysis.analysis}\n\nSuggestions:\n${analysis.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}`;
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Analyzing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load analysis</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Results</Text>
        <TouchableOpacity onPress={shareAnalysis} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>Analysis</Text>
          </View>
          <View style={styles.analysisCard}>
            <Text style={styles.analysisText}>{analysis.analysis}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={24} color="#6366f1" />
            <Text style={styles.sectionTitle}>Suggested Responses</Text>
          </View>
          {analysis.suggestions && analysis.suggestions.map((suggestion: string, index: number) => (
            <View key={index} style={styles.suggestionCard}>
              <View style={styles.suggestionHeader}>
                <Text style={styles.suggestionNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.suggestionText}>{suggestion}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copySuggestion(suggestion)}
              >
                <Ionicons name="copy-outline" size={18} color="#6366f1" />
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.newAnalysisButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.newAnalysisButtonText}>New Analysis</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    backgroundColor: '#eef2ff',
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
  },
  suggestionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 4,
  },
  newAnalysisButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  newAnalysisButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
