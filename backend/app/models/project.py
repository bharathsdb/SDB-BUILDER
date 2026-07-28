import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, Integer, Float, DateTime, Text, ForeignKey, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    plot_length: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    plot_width: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    facing: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    floor_count: Mapped[int] = mapped_column(Integer, default=1)
    budget_tier: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    style: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    vastu: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    shared: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    share_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    vastu_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    sustainability_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    stars: Mapped[int] = mapped_column(Integer, default=0)
    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    thumbnail: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    team_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    cost_estimate: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="projects")
    rooms: Mapped[List["Room"]] = relationship("Room", back_populates="project")
    floor_collection: Mapped[List["Floor"]] = relationship("Floor", back_populates="project")
    floor_plans: Mapped[List["FloorPlan"]] = relationship("FloorPlan", back_populates="project")
    conversations: Mapped[List["AIConversation"]] = relationship("AIConversation", back_populates="project")
    exports: Mapped[List["Export"]] = relationship("Export", back_populates="project")
    comments: Mapped[List["Comment"]] = relationship("Comment", back_populates="project")
    activity_logs: Mapped[List["ActivityLog"]] = relationship("ActivityLog", back_populates="project")
    team: Mapped[Optional["Team"]] = relationship("Team", back_populates="projects")
    render_jobs: Mapped[List["RenderJob"]] = relationship("RenderJob", back_populates="project")
    media_assets: Mapped[List["MediaAsset"]] = relationship("MediaAsset", back_populates="project")

    __table_args__ = (
        Index("ix_projects_user_status_shared", "user_id", "status", "shared"),
    )

    def __repr__(self) -> str:
        return f"<Project(id={self.id}, name={self.name}, status={self.status})>"
