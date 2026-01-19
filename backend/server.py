from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import base64
from io import BytesIO
from PIL import Image
import asyncio

# Load environment variables
load_dotenv()

# Import LLM integration
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

app = FastAPI(title="TalkTutor API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "test_database")
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
conversations_collection = db["conversations"]
analyses_collection = db["analyses"]
subscriptions_collection = db["subscriptions"]

# Pydantic models
class TextAnalysisRequest(BaseModel):
    user_id: str
    conversation_text: str
    tone: str
    goal: str

class ImageAnalysisRequest(BaseModel):
    user_id: str
    image_base64: str
    tone: str
    goal: str
    context: Optional[str] = None

class AnalysisResponse(BaseModel):
    analysis_id: str
    suggestions: List[str]
    analysis_text: str
    tone_used: str
    goal_used: str

class SubscriptionCheck(BaseModel):
    user_id: str
    is_subscribed: bool

# Helper function to generate unique session ID
def generate_session_id(user_id: str) -> str:
    return f"{user_id}_{datetime.utcnow().isoformat()}"

# Helper function to create AI suggestions
async def generate_suggestions(
    conversation_context: str,
    tone: str,
    goal: str,
    is_image: bool = False
) -> dict:
    """Generate AI-powered response suggestions"""
    
    # Create system message based on tone and goal
    system_message = f"""You are a social skills coach helping users improve their communication.

Current Conversation Context: {conversation_context}

User's Desired Tone: {tone}
User's Goal: {goal}

Provide:
1. A brief analysis of the current situation (2-3 sentences)
2. 3 different response suggestions that match the desired tone and achieve the goal
3. Brief explanation for each suggestion (1 sentence)

Format your response as:
ANALYSIS: [your analysis]
SUGGESTION 1: [response] - [reason]
SUGGESTION 2: [response] - [reason]
SUGGESTION 3: [response] - [reason]
"""

    try:
        # Create new chat instance for this request
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=generate_session_id("system"),
            system_message=system_message
        ).with_model("openai", "gpt-5.2")

        # Send message
        response = await chat.send_message(UserMessage(text="Please provide your analysis and suggestions."))
        
        # Parse response
        analysis_text = ""
        suggestions = []
        
        lines = response.split('\n')
        for line in lines:
            if line.startswith("ANALYSIS:"):
                analysis_text = line.replace("ANALYSIS:", "").strip()
            elif line.startswith("SUGGESTION"):
                suggestion = line.split(":", 1)[1].strip() if ":" in line else line
                suggestions.append(suggestion)
        
        return {
            "analysis": analysis_text,
            "suggestions": suggestions[:3],  # Ensure max 3 suggestions
            "raw_response": response
        }
        
    except Exception as e:
        print(f"Error generating suggestions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")

# Helper function to analyze image
async def analyze_image_content(image_base64: str, context: Optional[str] = None) -> str:
    """Use AI vision to analyze image and extract conversation context"""
    
    system_message = """You are analyzing an image to help understand social context.
This could be:
- A screenshot of a text conversation
- A social media post/story
- A photo someone shared
- A profile picture

Extract all visible text, describe the visual content, and identify any emotional tone or context.
Be concise but thorough."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=generate_session_id("vision"),
            system_message=system_message
        ).with_model("openai", "gpt-5.2")

        # Create image content
        image_content = ImageContent(image_base64=image_base64)
        
        prompt = "Analyze this image and extract all text, describe the content, and identify any social context or emotional tone."
        if context:
            prompt += f"\n\nAdditional context provided by user: {context}"

        message = UserMessage(
            text=prompt,
            file_contents=[image_content]
        )

        response = await chat.send_message(message)
        return response
        
    except Exception as e:
        print(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze image: {str(e)}")

# API Routes
@app.get("/")
def read_root():
    return {"message": "TalkTutor API is running"}

@app.post("/api/analyze-text")
async def analyze_text_conversation(request: TextAnalysisRequest):
    """Analyze a text conversation and provide suggestions"""
    
    try:
        # Generate suggestions
        result = await generate_suggestions(
            conversation_context=request.conversation_text,
            tone=request.tone,
            goal=request.goal,
            is_image=False
        )
        
        # Save to database
        analysis_doc = {
            "user_id": request.user_id,
            "conversation_text": request.conversation_text,
            "tone": request.tone,
            "goal": request.goal,
            "analysis": result["analysis"],
            "suggestions": result["suggestions"],
            "raw_response": result["raw_response"],
            "created_at": datetime.utcnow(),
            "type": "text"
        }
        
        analysis_id = analyses_collection.insert_one(analysis_doc).inserted_id
        
        return AnalysisResponse(
            analysis_id=str(analysis_id),
            suggestions=result["suggestions"],
            analysis_text=result["analysis"],
            tone_used=request.tone,
            goal_used=request.goal
        )
        
    except Exception as e:
        print(f"Error in analyze_text_conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-image")
async def analyze_image_conversation(request: ImageAnalysisRequest):
    """Analyze an image (screenshot or photo) and provide suggestions"""
    
    try:
        # First, analyze the image to extract context
        image_context = await analyze_image_content(
            request.image_base64,
            request.context
        )
        
        # Then generate suggestions based on the extracted context
        result = await generate_suggestions(
            conversation_context=image_context,
            tone=request.tone,
            goal=request.goal,
            is_image=True
        )
        
        # Save to database
        analysis_doc = {
            "user_id": request.user_id,
            "image_base64": request.image_base64,
            "image_context": image_context,
            "tone": request.tone,
            "goal": request.goal,
            "analysis": result["analysis"],
            "suggestions": result["suggestions"],
            "raw_response": result["raw_response"],
            "created_at": datetime.utcnow(),
            "type": "image"
        }
        
        analysis_id = analyses_collection.insert_one(analysis_doc).inserted_id
        
        return AnalysisResponse(
            analysis_id=str(analysis_id),
            suggestions=result["suggestions"],
            analysis_text=result["analysis"],
            tone_used=request.tone,
            goal_used=request.goal
        )
        
    except Exception as e:
        print(f"Error in analyze_image_conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/{user_id}")
async def get_user_history(user_id: str, limit: int = 20):
    """Get user's analysis history"""
    
    try:
        analyses = list(
            analyses_collection.find({"user_id": user_id})
            .sort("created_at", -1)
            .limit(limit)
        )
        
        # Convert ObjectId to string and format response
        for analysis in analyses:
            analysis["_id"] = str(analysis["_id"])
            analysis["created_at"] = analysis["created_at"].isoformat()
            # Don't send full image data in list view
            if "image_base64" in analysis:
                analysis["has_image"] = True
                del analysis["image_base64"]
        
        return {"analyses": analyses}
        
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analysis/{analysis_id}")
async def get_analysis_detail(analysis_id: str):
    """Get detailed analysis including image if available"""
    
    try:
        analysis = analyses_collection.find_one({"_id": ObjectId(analysis_id)})
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        analysis["_id"] = str(analysis["_id"])
        analysis["created_at"] = analysis["created_at"].isoformat()
        
        return analysis
        
    except Exception as e:
        print(f"Error fetching analysis detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/subscription/check")
async def check_subscription(user_id: str):
    """Check if user has active subscription"""
    
    # For now, return mock subscription status
    # In production, this would integrate with RevenueCat
    subscription = subscriptions_collection.find_one({"user_id": user_id})
    
    if subscription:
        is_active = subscription.get("is_active", False)
        expires_at = subscription.get("expires_at")
        
        # Check if subscription has expired
        if expires_at and expires_at < datetime.utcnow():
            is_active = False
            
        return {
            "user_id": user_id,
            "is_subscribed": is_active,
            "expires_at": expires_at.isoformat() if expires_at else None
        }
    
    return {
        "user_id": user_id,
        "is_subscribed": False,
        "expires_at": None
    }

@app.post("/api/subscription/mock-activate")
async def mock_activate_subscription(user_id: str):
    """Mock endpoint to activate subscription for testing"""
    
    # Add 30 days to current date
    from datetime import timedelta
    expires_at = datetime.utcnow() + timedelta(days=30)
    
    subscriptions_collection.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "is_active": True,
                "plan": "monthly",
                "expires_at": expires_at,
                "created_at": datetime.utcnow()
            }
        },
        upsert=True
    )
    
    return {
        "success": True,
        "message": "Subscription activated (mock)",
        "expires_at": expires_at.isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
