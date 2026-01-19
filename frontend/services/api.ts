import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('session_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired, clear token
      await AsyncStorage.removeItem('session_token');
    }
    return Promise.reject(error);
  }
);

export interface AnalyzeTextRequest {
  conversation_text: string;
  tone: string;
  goal: string;
}

export interface AnalyzeImageRequest {
  image_base64: string;
  tone: string;
  goal: string;
  context?: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  suggestions: string[];
  analysis_text: string;
  tone_used: string;
  goal_used: string;
}

export const analyzeText = async (data: AnalyzeTextRequest): Promise<AnalysisResponse> => {
  const response = await api.post('/api/analyze-text', data);
  return response.data;
};

export const analyzeImage = async (data: AnalyzeImageRequest): Promise<AnalysisResponse> => {
  const response = await api.post('/api/analyze-image', data);
  return response.data;
};

export const getUserHistory = async (limit: number = 20) => {
  const response = await api.get('/api/history', { params: { limit } });
  return response.data;
};

export const getAnalysisDetail = async (analysisId: string) => {
  const response = await api.get(`/api/analysis/${analysisId}`);
  return response.data;
};

export const getSubscriptionPlans = async () => {
  const response = await api.get('/api/subscription/plans');
  return response.data;
};

export const activateSubscription = async (plan: string, billing_period: string) => {
  const response = await api.post('/api/subscription/activate', null, {
    params: { plan, billing_period }
  });
  return response.data;
};

export default api;
