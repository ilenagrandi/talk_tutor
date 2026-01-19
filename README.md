# TalkTutor - AI-Powered Social Skills Coach

TalkTutor is a mobile app that helps users improve their communication skills using AI-powered analysis and suggestions.

## Features

✅ **AI-Powered Analysis**
- Analyze text conversations or images (screenshots, social media posts)
- Get instant AI feedback using GPT-5.2 with vision capabilities

✅ **Customizable Communication Styles**
- Professional, Friendly, Confident, Empathetic, Flirty, Witty

✅ **Goal-Oriented Suggestions**
- Get a Date, Resolve Conflict, Network Professionally, Make a Friend, Negotiate/Close Deal, Keep It Casual

✅ **Complete Mobile Experience**
- Beautiful onboarding flow
- Intuitive upload interface
- Real-time AI analysis
- History tracking
- Subscription management

✅ **Payment Integration**
- RevenueCat integration structure (mock for testing)
- Subscription paywall before using analysis features
- Monthly and annual plans

## Tech Stack

**Frontend:** Expo React Native, TypeScript, Zustand, Expo Router, Expo Image Picker, Axios

**Backend:** FastAPI (Python), MongoDB, Emergent Integrations (LLM), GPT-5.2 with Vision

**AI:** OpenAI GPT-5.2 for text analysis, GPT-4 Vision for image analysis

## API Endpoints

**Analysis:**
- `POST /api/analyze-text` - Analyze text conversation
- `POST /api/analyze-image` - Analyze image (base64)

**History:**
- `GET /api/history/{user_id}` - Get user's analysis history
- `GET /api/analysis/{analysis_id}` - Get specific analysis details

**Subscription:**
- `POST /api/subscription/check?user_id={id}` - Check subscription status
- `POST /api/subscription/mock-activate?user_id={id}` - Mock subscription activation (testing)

## How It Works

1. **Onboarding**: Users go through a 4-step onboarding
2. **Upload Content**: Paste text or upload screenshots/images
3. **Select Preferences**: Choose communication tone and goal
4. **Payment Wall**: Non-subscribers see subscription prompt
5. **AI Analysis**: Backend processes with GPT-5.2 or GPT-4 Vision
6. **Get Suggestions**: Receive 3 tailored response suggestions
7. **History**: Access past analyses anytime

## Testing

### Backend
```bash
curl http://localhost:8001/
curl -X POST "http://localhost:8001/api/subscription/mock-activate?user_id=test123"
```

### Frontend
Access the app at the provided Expo preview URL and test all flows.

## Important Notes

- **Images**: Always use base64 format (JPEG, PNG, WEBP)
- **RevenueCat**: Currently using mock for testing. For production, set up App Store & Play Store
- **Deployment**: Requires Apple Developer & Google Play accounts

## Current Status

✅ Complete UI/UX | ✅ Onboarding | ✅ AI Analysis | ✅ Subscription Paywall | ✅ History
⏳ Production RevenueCat (requires store setup) | ⏳ App Store/Play Store deployment
