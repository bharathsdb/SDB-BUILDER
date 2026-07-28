from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.user import User
from app.models.project import Project
from app.models.transaction import Transaction
from app.models.activity_log import ActivityLog
from app.models.audit_log import AuditLog
from app.models.ai_conversation import AIConversation
from typing import Optional

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users")
async def admin_get_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    current_user: User = Depends(require_roles("super_admin", "enterprise_admin")),
    db: AsyncSession = Depends(get_db),
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    query = query.order_by(desc(User.created_at))

    total = await db.execute(select(func.count()).select_from(query.subquery()))
    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    users = result.scalars().all()

    return {
        "users": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "plan": u.plan,
                "verified": u.verified,
                "is_active": u.is_active,
                "projects_count": u.projects_count,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": total.scalar() or 0,
        "page": page,
        "per_page": per_page,
    }


@router.patch("/users/{user_id}/role")
async def admin_update_user_role(
    user_id: str,
    role: str,
    current_user: User = Depends(require_roles("super_admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    await db.flush()
    return {"success": True}


@router.patch("/users/{user_id}/status")
async def admin_toggle_user_status(
    user_id: str,
    is_active: bool,
    current_user: User = Depends(require_roles("super_admin", "enterprise_admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    await db.flush()
    return {"success": True}


@router.get("/projects")
async def admin_get_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_roles("super_admin", "enterprise_admin", "team_admin")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Project).order_by(desc(Project.created_at))
    total = await db.execute(select(func.count()).select_from(query.subquery()))
    result = await db.execute(query.offset((page - 1) * per_page).limit(per_page))
    projects = result.scalars().all()

    return {
        "projects": [
            {
                "id": p.id,
                "user_id": p.user_id,
                "name": p.name,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in projects
        ],
        "total": total.scalar() or 0,
        "page": page,
        "per_page": per_page,
    }


@router.get("/revenue")
async def admin_get_revenue(
    current_user: User = Depends(require_roles("super_admin", "enterprise_admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.status == "SUCCESS")
    )
    transactions = result.scalars().all()

    total_revenue = sum(t.amount for t in transactions)
    monthly = {}
    for t in transactions:
        if t.created_at:
            month_key = t.created_at.strftime("%Y-%m")
            monthly[month_key] = monthly.get(month_key, 0) + t.amount

    return {
        "total_revenue": total_revenue,
        "total_transactions": len(transactions),
        "monthly_revenue": monthly,
    }


@router.get("/ai-usage")
async def admin_get_ai_usage(
    current_user: User = Depends(require_roles("super_admin", "enterprise_admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AIConversation))
    conversations = result.scalars().all()

    return {
        "total_conversations": len(conversations),
        "total_messages": len(conversations),
    }


@router.get("/logs")
async def admin_get_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_roles("super_admin")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AuditLog).order_by(desc(AuditLog.created_at))
        .offset((page - 1) * per_page).limit(per_page)
    )
    logs = result.scalars().all()

    return {
        "logs": [
            {
                "id": l.id,
                "user_id": l.user_id,
                "admin_id": l.admin_id,
                "action": l.action,
                "resource_type": l.resource_type,
                "resource_id": l.resource_id,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in logs
        ],
        "page": page,
        "per_page": per_page,
    }
