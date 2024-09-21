from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models, schemas
import uuid
import datetime

router = APIRouter(
    prefix="/session",
    tags=["session"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/initialize_session", response_model=schemas.Session)
def initialize_session(db: Session = Depends(get_db)):
    session_id = str(uuid.uuid4())
    db_session = models.Session(session_id=session_id)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session
