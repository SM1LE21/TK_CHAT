from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models, schemas, utils
import openai
from app.config import OPENAI_API_KEY
from app.utils import rate_limit
from app.utils.logger import logger

openai.api_key = OPENAI_API_KEY

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.Message)
def chat(message: schemas.Message, db: Session = Depends(get_db)):
    # Check if session is active
    if not utils.auth.is_session_active(message.session_id, db):
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    
     # Rate limiting
    if rate_limit.is_rate_limited(message.session_id, db):
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")

    # Save user message
    user_message = models.Message(
        session_id=message.session_id,
        role="user",
        content=message.content
    )
    db.add(user_message)
    db.commit()

    logger.info(f"Session {message.session_id}: User message received")

    # Retrieve conversation history
    messages = db.query(models.Message).filter(models.Message.session_id == message.session_id).order_by(models.Message.timestamp).all()
    conversation = [{"role": msg.role, "content": msg.content} for msg in messages]

    # Call OpenAI API
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=conversation
        )
        ai_content = response.choices[0].message.content

        # Save AI response
        ai_message = models.Message(
            session_id=message.session_id,
            role="assistant",
            content=ai_content
        )
        db.add(ai_message)
        db.commit()

        logger.info(f"Session {message.session_id}: AI response generated")

        return schemas.Message(
            session_id=message.session_id,
            role="assistant",
            content=ai_content
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
