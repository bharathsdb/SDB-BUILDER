from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.dependencies import get_current_user, get_current_user_optional
from app.schemas.ai import PlanRequest, PlanResponse
from app.schemas.chat import ChatRequest, ChatResponse
from app.ai.engine import ArchitectEngine
from app.ai.chat_assistant import ArchitectChatAssistant
from app.models.user import User
from app.models.ai_conversation import AIConversation

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/generate")
async def generate_plan(req: PlanRequest):
    engine = ArchitectEngine()
    result = engine.generate_plan(req.model_dump())
    return result


@router.post("/chat")
async def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    assistant = ArchitectChatAssistant()
    result = assistant.process_message(req.message, req.project_id)

    user_msg = AIConversation(
        user_id=current_user.id,
        project_id=req.project_id,
        role="user",
        content=req.message,
    )
    asst_msg = AIConversation(
        user_id=current_user.id,
        project_id=req.project_id,
        role="assistant",
        content=result["reply"],
    )
    db.add(user_msg)
    db.add(asst_msg)
    await db.flush()

    return {
        "reply": result["reply"],
        "action": result.get("action"),
        "conversation_id": asst_msg.id,
    }


@router.get("/chat")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIConversation).where(AIConversation.user_id == current_user.id)
        .order_by(desc(AIConversation.created_at)).limit(100)
    )
    conversations = result.scalars().all()
    return {
        "conversations": [
            {
                "id": c.id,
                "user_id": c.user_id,
                "project_id": c.project_id,
                "role": c.role,
                "content": c.content,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in conversations
        ]
    }
