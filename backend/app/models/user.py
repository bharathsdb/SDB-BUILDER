import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, Integer, Float, DateTime, Text, ForeignKey, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="user", nullable=False, index=True)
    plan: Mapped[str] = mapped_column(String(50), default="free", nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    ai_credits_used: Mapped[int] = mapped_column(Integer, default=0)
    ai_credits_total: Mapped[int] = mapped_column(Integer, default=50)
    storage_used_mb: Mapped[float] = mapped_column(Float, default=0.0)
    storage_quota_mb: Mapped[float] = mapped_column(Float, default=5120.0)
    projects_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    projects: Mapped[List["Project"]] = relationship("Project", back_populates="user")
    conversations: Mapped[List["AIConversation"]] = relationship("AIConversation", back_populates="user")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user")
    settings_rel: Mapped[Optional["Settings"]] = relationship("Settings", back_populates="user", uselist=False)
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="user")
    teams_owned: Mapped[List["Team"]] = relationship("Team", back_populates="owner", foreign_keys="[Team.owner_id]")
    team_memberships: Mapped[List["TeamMember"]] = relationship("TeamMember", back_populates="user")
    user_sessions: Mapped[List["UserSession"]] = relationship("UserSession", back_populates="user")
    exports: Mapped[List["Export"]] = relationship("Export", back_populates="user")
    sent_messages: Mapped[List["Message"]] = relationship("Message", back_populates="sender", foreign_keys="[Message.sender_id]")
    received_messages: Mapped[List["Message"]] = relationship("Message", back_populates="receiver", foreign_keys="[Message.receiver_id]")
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="user")
    reviews_as_reviewer: Mapped[List["Review"]] = relationship("Review", back_populates="reviewer", foreign_keys="[Review.reviewer_id]")
    marketplace_listings: Mapped[List["MarketplaceListing"]] = relationship("MarketplaceListing", back_populates="user")
    architect_profile: Mapped[Optional["Architect"]] = relationship("Architect", back_populates="user", uselist=False)
    builder_profile: Mapped[Optional["Builder"]] = relationship("Builder", back_populates="user", uselist=False)
    render_jobs: Mapped[List["RenderJob"]] = relationship("RenderJob", back_populates="user")
    media_assets: Mapped[List["MediaAsset"]] = relationship("MediaAsset", back_populates="user")
    activity_logs: Mapped[List["ActivityLog"]] = relationship("ActivityLog", back_populates="user")
    subscription: Mapped[Optional["Subscription"]] = relationship("Subscription", back_populates="user", uselist=False)
    templates_created: Mapped[List["Template"]] = relationship("Template", back_populates="creator", foreign_keys="[Template.created_by]")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user", foreign_keys="[AuditLog.user_id]")

    __table_args__ = (
        Index("ix_users_email_role", "email", "role"),
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token: Mapped[str] = mapped_column(String(500), nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="user_sessions")

    def __repr__(self) -> str:
        return f"<UserSession(id={self.id}, user_id={self.user_id}, is_active={self.is_active})>"
