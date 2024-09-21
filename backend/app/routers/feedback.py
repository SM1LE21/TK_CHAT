from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models, schemas
from app.utils import auth

router = APIRouter(
    prefix="/feedback",
    tags=["feedback"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def submit_feedback(feedback: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    # Check if session is active
    if not auth.is_session_active(feedback.session_id, db):
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    db_feedback = models.Feedback(
        session_id=feedback.session_id,
        feedback=feedback.feedback
    )
    db.add(db_feedback)
    db.commit()
    return {"detail": "Feedback received"}
