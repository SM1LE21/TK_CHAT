from fastapi import APIRouter

router = APIRouter(
    prefix="/config",
    tags=["config"]
)

@router.get("/")
def get_config():
    config = {
        "showFeedback": True,  # Set to False to hide the feedback form
    }
    return config
