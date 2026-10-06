from fastapi import APIRouter

from models.chat_model import ChatRequest
from services.chat_service import process_chat

router = APIRouter()

@router.post("/chat")
def chat(chat_request : ChatRequest):
    response = process_chat(chat_request.message)
    return {
        "response" : response
    }