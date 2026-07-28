from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str = ""


class GoogleLoginRequest(BaseModel):
    token: str


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    
    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    user: "UserResponse"
    access_token: str
    refresh_token: str


class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    email: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str
