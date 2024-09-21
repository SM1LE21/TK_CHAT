from fastapi import FastAPI, HTTPException
from app.routers import chat, session, feedback
import uvicorn
from app.database import engine
from app import models
from fastapi.responses import JSONResponse

from app.utils.logger import logger

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include Routers
app.include_router(chat.router)
app.include_router(session.router)
app.include_router(feedback.router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )