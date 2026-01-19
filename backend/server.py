from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import base64
from io import BytesIO
from PIL import Image
import asyncio
import httpx
import uuid
import traceback

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
AUTH_SESSION_API = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
user_sessions_collection = db["user_sessions"]
conversations_collection = db["conversations"]
analyses_collection = db["analyses"]
subscriptions_collection = db["subscriptions"]

# Subscription Plans
PLANS = {
    "standard": {
        "name": "Standard",
        "price_monthly": 9.99,
        "price_annual": 99.99,
        "ai_model": "gpt-5.2",
        "suggestions_count": 3,
        "features": ["Unlimited analyses", "Standard AI model", "3 suggestions", "Full history"]
    },
    "premium": {
        "name": "Premium",
        "price_monthly": 19.99,
        "price_annual": 199.99,
        "ai_model": "gpt-5.2",
        "suggestions_count": 5,
        "features": ["Everything in Standard", "Advanced analysis", "5 suggestions", "Emotional tone analysis", "Follow-up suggestions", "Priority support"]
    },
    "pro": {
        "name": "Pro",
        "price_monthly": 29.99,
        "price_annual": 299.99,
        "ai_model": "gpt-5.2",
        "suggestions_count": 5,
        "features": ["Everything in Premium", "Multi-language", "PDF exports", "Pattern analysis", "API access"]
    }
}

# Pydantic models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime
    subscription_plan: Optional[str] = None
    subscription_expires: Optional[datetime] = None

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str]
    session_token: str

class TextAnalysisRequest(BaseModel):
    conversation_text: str
    tone: str
    goal: str
    
    @validator('conversation_text')
    def validate_text(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Conversation text cannot be empty')
        if len(v) > 10000:
            raise ValueError('Conversation text is too long (max 10000 characters)')
        return v

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    tone: str
    goal: str
    context: Optional[str] = None
    
    @validator('image_base64')
    def validate_image(cls, v):
        if not v:
            raise ValueError('Image data is required')
        try:
            # Validate base64 format
            base64.b64decode(v)
        except Exception:
            raise ValueError('Invalid image format')
        return v

class AnalysisResponse(BaseModel):
    analysis_id: str
    suggestions: List[str]
    analysis_text: str
    tone_used: str
    goal_used: str

class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[str] = None

# Error handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail,
            message=str(exc.detail),
            details=None
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled error: {exc}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal Server Error",
            message="An unexpected error occurred",
            details=str(exc) if os.getenv("DEBUG") == "true" else None
        ).dict()
    )

# Helper function to generate unique session ID
def generate_session_id(user_id: str) -> str:
    return f"{user_id}_{datetime.utcnow().isoformat()}"

# Authentication dependency
async def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[User]:
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header provided")
    
    # Extract token
    if authorization.startswith("Bearer "):
        session_token = authorization.replace("Bearer ", "")
    else:
        session_token = authorization
    
    try:
        # Check session
        session = user_sessions_collection.find_one(
            {"session_token": session_token},
            {"_id": 0}
        )
        
        if not session:
            raise HTTPException(status_code=401, detail="Invalid session token")
        
        # Check expiry
        expires_at = session["expires_at"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        # Get user
        user_doc = users_collection.find_one(
            {"user_id": session["user_id"]},
            {"_id": 0}
        )
        
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        return User(**user_doc)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=500, detail="Authentication error")

# Check subscription and plan limits
def check_subscription_and_limits(user: User, required_plan: str = None) -> dict:
    if not user.subscription_plan:
        raise HTTPException(status_code=402, detail="Subscription required")
    
    # Check if subscription is expired
    if user.subscription_expires:
        expires = user.subscription_expires
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if expires < datetime.now(timezone.utc):
            raise HTTPException(status_code=402, detail="Subscription expired")
    
    plan_info = PLANS.get(user.subscription_plan)
    if not plan_info:
        raise HTTPException(status_code=400, detail="Invalid subscription plan")
    
    # Check if user has required plan level
    if required_plan:
        plan_levels = {"standard": 1, "premium": 2, "pro": 3}
        user_level = plan_levels.get(user.subscription_plan, 0)
        required_level = plan_levels.get(required_plan, 0)
        
        if user_level < required_level:
            raise HTTPException(
                status_code=403,
                detail=f"This feature requires {PLANS[required_plan]['name']} plan or higher"
            )
    
    return plan_info

# Helper function to create AI suggestions
async def generate_suggestions(
    conversation_context: str,
    tone: str,
    goal: str,
    plan_info: dict,
    is_image: bool = False
) -> dict:
    """Generate AI-powered response suggestions based on plan"""
    
    suggestions_count = plan_info["suggestions_count"]
    
    # Create system message based on tone and goal
    system_message = f"""You are a professional social skills coach helping users improve their communication.

Current Conversation Context: {conversation_context}

User's Desired Tone: {tone}
User's Goal: {goal}

Provide:
1. A brief analysis of the current situation (2-3 sentences)
2. {suggestions_count} different response suggestions that match the desired tone and achieve the goal
3. Brief explanation for each suggestion (1 sentence)

Format your response as:
ANALYSIS: [your analysis]
SUGGESTION 1: [response] - [reason]
SUGGESTION 2: [response] - [reason]
{'SUGGESTION 3: [response] - [reason]' if suggestions_count >= 3 else ''}
{'SUGGESTION 4: [response] - [reason]' if suggestions_count >= 4 else ''}
{'SUGGESTION 5: [response] - [reason]' if suggestions_count >= 5 else ''}
"""

    try:
        # Create new chat instance for this request
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=generate_session_id("system"),
            system_message=system_message
        ).with_model("openai", plan_info["ai_model"])

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
            "analysis": analysis_text or "Analysis completed successfully.",
            "suggestions": suggestions[:suggestions_count],
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
    return {"message": "TalkTutor API is running", "version": "2.0.0"}

# Auth endpoints
@app.post("/api/auth/session")
async def exchange_session_id(x_session_id: str = Header(...)):
    """Exchange session_id for user data and session_token"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                AUTH_SESSION_API,
                headers={"X-Session-ID": x_session_id}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session ID")
            
            user_data = response.json()
            session_response = SessionDataResponse(**user_data)
            
            # Check if user exists
            existing_user = users_collection.find_one(
                {"email": session_response.email},
                {"_id": 0}
            )
            
            if not existing_user:
                # Create new user
                user_id = f"user_{uuid.uuid4().hex[:12]}"
                user_doc = {
                    "user_id": user_id,
                    "email": session_response.email,
                    "name": session_response.name,
                    "picture": session_response.picture,
                    "created_at": datetime.now(timezone.utc),
                    "subscription_plan": None,
                    "subscription_expires": None
                }
                users_collection.insert_one(user_doc)
            else:
                user_id = existing_user["user_id"]
            
            # Create session
            session_doc = {
                "user_id": user_id,
                "session_token": session_response.session_token,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
                "created_at": datetime.now(timezone.utc)
            }
            user_sessions_collection.insert_one(session_doc)
            
            return {
                "user_id": user_id,
                "email": session_response.email,
                "name": session_response.name,
                "picture": session_response.picture,
                "session_token": session_response.session_token
            }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Session exchange error: {e}")
        raise HTTPException(status_code=500, detail="Failed to exchange session")

@app.get("/api/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@app.post("/api/auth/logout")
async def logout(current_user: User = Depends(get_current_user), authorization: str = Header(...)):
    """Logout user"""
    try:
        session_token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        user_sessions_collection.delete_one({"session_token": session_token})
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Logout failed")

# Analysis endpoints
@app.post("/api/analyze-text", response_model=AnalysisResponse)
async def analyze_text_conversation(request: TextAnalysisRequest, current_user: User = Depends(get_current_user)):
    """Analyze a text conversation and provide suggestions"""
    
    try:
        # Check subscription
        plan_info = check_subscription_and_limits(current_user)
        
        # Generate suggestions
        result = await generate_suggestions(
            conversation_context=request.conversation_text,
            tone=request.tone,
            goal=request.goal,
            plan_info=plan_info,
            is_image=False
        )
        
        # Save to database
        analysis_doc = {
            "user_id": current_user.user_id,
            "conversation_text": request.conversation_text,
            "tone": request.tone,
            "goal": request.goal,
            "analysis": result["analysis"],
            "suggestions": result["suggestions"],
            "raw_response": result["raw_response"],
            "created_at": datetime.utcnow(),
            "type": "text",
            "plan": current_user.subscription_plan
        }
        
        analysis_id = analyses_collection.insert_one(analysis_doc).inserted_id
        
        return AnalysisResponse(
            analysis_id=str(analysis_id),
            suggestions=result["suggestions"],
            analysis_text=result["analysis"],
            tone_used=request.tone,
            goal_used=request.goal
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_text_conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-image", response_model=AnalysisResponse)
async def analyze_image_conversation(request: ImageAnalysisRequest, current_user: User = Depends(get_current_user)):
    """Analyze an image (screenshot or photo) and provide suggestions"""
    
    try:
        # Check subscription
        plan_info = check_subscription_and_limits(current_user)
        
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
            plan_info=plan_info,
            is_image=True
        )
        
        # Save to database
        analysis_doc = {
            "user_id": current_user.user_id,
            "image_base64": request.image_base64,
            "image_context": image_context,
            "tone": request.tone,
            "goal": request.goal,
            "analysis": result["analysis"],
            "suggestions": result["suggestions"],
            "raw_response": result["raw_response"],
            "created_at": datetime.utcnow(),
            "type": "image",
            "plan": current_user.subscription_plan
        }
        
        analysis_id = analyses_collection.insert_one(analysis_doc).inserted_id
        
        return AnalysisResponse(
            analysis_id=str(analysis_id),
            suggestions=result["suggestions"],
            analysis_text=result["analysis"],
            tone_used=request.tone,
            goal_used=request.goal
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_image_conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_user_history(current_user: User = Depends(get_current_user), limit: int = 20):
    """Get user's analysis history"""
    
    try:
        analyses = list(
            analyses_collection.find({"user_id": current_user.user_id})
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
async def get_analysis_detail(analysis_id: str, current_user: User = Depends(get_current_user)):
    """Get detailed analysis including image if available"""
    
    try:
        analysis = analyses_collection.find_one({"_id": ObjectId(analysis_id)})
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Check ownership
        if analysis["user_id"] != current_user.user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        analysis["_id"] = str(analysis["_id"])
        analysis["created_at"] = analysis["created_at"].isoformat()
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching analysis detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Subscription endpoints
@app.get("/api/subscription/plans")
async def get_plans():
    """Get all available subscription plans"""
    return {"plans": PLANS}

@app.post("/api/subscription/activate")
async def activate_subscription(
    plan: str,
    billing_period: str,
    current_user: User = Depends(get_current_user)
):
    """Activate or update subscription (mock for testing)"""
    
    if plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    if billing_period not in ["monthly", "annual"]:
        raise HTTPException(status_code=400, detail="Invalid billing period")
    
    # Calculate expiry
    if billing_period == "monthly":
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    else:
        expires_at = datetime.now(timezone.utc) + timedelta(days=365)
    
    # Update user
    users_collection.update_one(
        {"user_id": current_user.user_id},
        {
            "$set": {
                "subscription_plan": plan,
                "subscription_expires": expires_at
            }
        }
    )
    
    return {
        "success": True,
        "plan": plan,
        "expires_at": expires_at.isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
