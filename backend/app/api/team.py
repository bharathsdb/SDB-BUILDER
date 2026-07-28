from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.team import Team, TeamMember

router = APIRouter(prefix="/api/team", tags=["Team"])


@router.get("/members")
async def get_team_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    owned = await db.execute(select(Team).where(Team.owner_id == current_user.id))
    teams = owned.scalars().all()

    member_teams = await db.execute(
        select(Team).join(TeamMember).where(TeamMember.user_id == current_user.id)
    )
    teams.extend(member_teams.scalars().all())

    members = []
    for team in teams:
        result = await db.execute(
            select(User).join(TeamMember).where(TeamMember.team_id == team.id)
        )
        for user in result.scalars().all():
            members.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": "member",
                "team_id": team.id,
                "team_name": team.name,
            })

    return {"members": members}
