from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import LoginRequest, SignupRequest, ResetPasswordRequest, VerifyEmailRequest, RefreshTokenRequest, GoogleLoginRequest
from app.schemas.user import UserResponse, UserUpdateRequest
from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.login(req)
    return result


@router.post("/google-login")
async def google_login(req: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.google_login(req.token)
    return result


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.signup(req)
    return result


@router.post("/logout")
async def logout():
    return {"success": True}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return {"user": service._user_to_dict(current_user)}


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.reset_password(req.email, req.new_password)


@router.post("/verify-email")
async def verify_email(req: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.verify_email(req.email)


@router.post("/refresh")
async def refresh_token(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.refresh_token(req.refresh_token)


@router.patch("/me")
async def update_me(
    req: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    result = await service.update_user(current_user.id, req.model_dump(exclude_unset=True))
    return {"user": result}
