from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SessionCreate(BaseModel):
    pass  # No data needed to create a session

class Session(BaseModel):
    session_id: str
    created_at: datetime
    last_active: datetime
    is_active: int

    class Config:
        orm_mode = True

class Message(BaseModel):
    session_id: str
    role: str  # 'user' or 'assistant'
    content: str

    class Config:
        orm_mode = True

class FeedbackCreate(BaseModel):
    session_id: str
    feedback: str
