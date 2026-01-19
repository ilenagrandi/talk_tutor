import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AnalyzeTextRequest {
  user_id: string;
  conversation_text: string;
  tone: string;
  goal: string;
}

export interface AnalyzeImageRequest {
  user_id: string;
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

export const getUserHistory = async (userId: string, limit: number = 20) => {
  const response = await api.get(`/api/history/${userId}`, { params: { limit } });
  return response.data;
};

export const getAnalysisDetail = async (analysisId: string) => {
  const response = await api.get(`/api/analysis/${analysisId}`);
  return response.data;
};

export const checkSubscription = async (userId: string) => {
  const response = await api.post('/api/subscription/check', null, {
    params: { user_id: userId },
  });
  return response.data;
};

export const mockActivateSubscription = async (userId: string) => {
  const response = await api.post('/api/subscription/mock-activate', null, {
    params: { user_id: userId },
  });
  return response.data;
};

export default api;
