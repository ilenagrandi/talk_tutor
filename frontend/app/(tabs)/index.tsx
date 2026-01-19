import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { TONE_OPTIONS, GOAL_OPTIONS } from '../../constants/options';
import { analyzeText, analyzeImage } from '../../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateSubscriptionStatus, isDarkMode } = useStore();
  const [showPaywall, setShowPaywall] = useState(false);
  const [analysisType, setAnalysisType] = useState<'text' | 'image' | null>(null);
  const [conversationText, setConversationText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [contextText, setContextText] = useState('');
  const [selectedTone, setSelectedTone] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [showTonePicker, setShowTonePicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const colors = {
    background: isDarkMode ? '#111827' : '#f9fafb',
    card: isDarkMode ? '#1f2937' : '#fff',
    text: isDarkMode ? '#f9fafb' : '#1f2937',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    primary: '#6366f1',
    primaryLight: isDarkMode ? '#4f46e5' : '#eef2ff',
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].base64);
      setAnalysisType('image');
    }
  };

  const handleAnalyze = async () => {
    if (!user?.isSubscribed) {
      setShowPaywall(true);
      return;
    }

    if (!selectedTone || !selectedGoal) {
      Alert.alert('Missing Information', 'Please select both a tone and a goal');
      return;
    }

    if (!conversationText && !selectedImage) {
      Alert.alert('No Content', 'Please enter text or upload an image');
      return;
    }

    setIsAnalyzing(true);

    try {
      let response;
      if (analysisType === 'text' && conversationText) {
        response = await analyzeText({
          user_id: user.id,
          conversation_text: conversationText,
          tone: selectedTone,
          goal: selectedGoal,
        });
      } else if (analysisType === 'image' && selectedImage) {
        response = await analyzeImage({
          user_id: user.id,
          image_base64: selectedImage,
          tone: selectedTone,
          goal: selectedGoal,
          context: contextText || undefined,
        });
      }

      if (response) {
        router.push({
          pathname: '/results',
          params: {
            analysisId: response.analysis_id,
            suggestions: JSON.stringify(response.suggestions),
            analysis: response.analysis_text,
          },
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getToneLabel = () => {
    const tone = TONE_OPTIONS.find(t => t.id === selectedTone);
    return tone ? tone.label : 'Select Tone';
  };

  const getGoalLabel = () => {
    const goal = GOAL_OPTIONS.find(g => g.id === selectedGoal);
    return goal ? goal.label : 'Select Goal';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TalkTutor</Text>
        <Text style={styles.headerSubtitle}>Your AI Communication Coach</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>¿Qué quieres analizar?</Text>

            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={[
                  styles.uploadButton, 
                  { backgroundColor: colors.card, borderColor: analysisType === 'text' ? colors.primary : colors.border },
                  analysisType === 'text' && { backgroundColor: colors.primaryLight }
                ]}
                onPress={() => {
                  setAnalysisType('text');
                  setSelectedImage(null);
                }}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={32}
                  color={analysisType === 'text' ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.uploadButtonText, 
                  { color: analysisType === 'text' ? colors.primary : colors.textSecondary }
                ]}>
                  Texto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.uploadButton, 
                  { backgroundColor: colors.card, borderColor: analysisType === 'image' ? colors.primary : colors.border },
                  analysisType === 'image' && { backgroundColor: colors.primaryLight }
                ]}
                onPress={pickImage}
              >
                <Ionicons
                  name="image"
                  size={32}
                  color={analysisType === 'image' ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.uploadButtonText, 
                  { color: analysisType === 'image' ? colors.primary : colors.textSecondary }
                ]}>
                  Imagen
                </Text>
              </TouchableOpacity>
            </View>

            {analysisType === 'text' && (
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                multiline
                placeholder="Pega tu conversación aquí..."
                placeholderTextColor={colors.textSecondary}
                value={conversationText}
                onChangeText={setConversationText}
                textAlignVertical="top"
              />
            )}

            {analysisType === 'image' && selectedImage && (
              <View style={[styles.imagePreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${selectedImage}` }}
                  style={styles.imagePreviewImage}
                  resizeMode="cover"
                />
                <View style={styles.imagePreviewOverlay}>
                  <TouchableOpacity onPress={pickImage} style={styles.changeImageButton}>
                    <Ionicons name="camera" size={20} color="#fff" />
                    <Text style={styles.changeImageText}>Cambiar Imagen</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {(analysisType === 'text' || analysisType === 'image') && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Contexto Adicional (Opcional)</Text>
              <TextInput
                style={[styles.contextInput, { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                multiline
                placeholder="Agrega contexto sobre la conversación, la persona o tu situación..."
                placeholderTextColor={colors.textSecondary}
                value={contextText}
                onChangeText={setContextText}
                textAlignVertical="top"
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>¿Cómo quieres sonar?</Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowTonePicker(true)}
            >
              <Text style={[styles.selectorText, { color: colors.text }]}>{getToneLabel()}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>¿Cuál es tu objetivo?</Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowGoalPicker(true)}
            >
              <Text style={[styles.selectorText, { color: colors.text }]}>{getGoalLabel()}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.analyzeButtonText}>Analyze & Get Suggestions</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Tone Picker Modal */}
      <Modal visible={showTonePicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Communication Tone</Text>
              <TouchableOpacity onPress={() => setShowTonePicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {TONE_OPTIONS.map((tone) => (
                <TouchableOpacity
                  key={tone.id}
                  style={styles.optionItem}
                  onPress={() => {
                    setSelectedTone(tone.id);
                    setShowTonePicker(false);
                  }}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons name={tone.icon as any} size={24} color="#6366f1" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{tone.label}</Text>
                    <Text style={styles.optionDescription}>{tone.description}</Text>
                  </View>
                  {selectedTone === tone.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Goal Picker Modal */}
      <Modal visible={showGoalPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Goal</Text>
              <TouchableOpacity onPress={() => setShowGoalPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {GOAL_OPTIONS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={styles.optionItem}
                  onPress={() => {
                    setSelectedGoal(goal.id);
                    setShowGoalPicker(false);
                  }}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons name={goal.icon as any} size={24} color="#6366f1" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{goal.label}</Text>
                    <Text style={styles.optionDescription}>{goal.description}</Text>
                  </View>
                  {selectedGoal === goal.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Paywall Modal */}
      <Modal visible={showPaywall} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.paywallContent}>
            <Text style={styles.paywallIcon}>🔒</Text>
            <Text style={styles.paywallTitle}>Premium Feature</Text>
            <Text style={styles.paywallDescription}>
              Subscribe to unlock AI-powered conversation analysis and get unlimited suggestions
            </Text>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => {
                setShowPaywall(false);
                router.push('/subscription');
              }}
            >
              <Text style={styles.subscribeButtonText}>View Plans</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closePaywallButton}
              onPress={() => setShowPaywall(false)}
            >
              <Text style={styles.closePaywallText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  uploadButtonActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  uploadButtonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  uploadButtonTextActive: {
    color: '#6366f1',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    height: 150,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    marginTop: 12,
  },
  contextInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    height: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 15,
    color: '#6b7280',
  },
  imagePreview: {
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    height: 300,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreviewImage: {
    width: '100%',
    height: '100%',
  },
  imagePreviewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    alignItems: 'center',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeImageText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  selector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectorText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  analyzeButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  paywallContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  paywallIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  paywallDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  subscribeButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  closePaywallButton: {
    padding: 12,
  },
  closePaywallText: {
    color: '#6b7280',
    fontSize: 16,
  },
});
