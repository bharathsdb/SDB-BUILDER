import uuid
from typing import Optional
from sqlalchemy import String, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    floor_plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("floor_plans.id", ondelete="SET NULL"), nullable=True)
    floor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("floors.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    room_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    width: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    length: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    height: Mapped[float] = mapped_column(Float, default=10.0)
    level: Mapped[int] = mapped_column(Integer, default=0)
    x: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    y: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    ceiling_height: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    project: Mapped["Project"] = relationship("Project", back_populates="rooms")
    floor_plan: Mapped[Optional["FloorPlan"]] = relationship("FloorPlan", back_populates="rooms")
    floor: Mapped[Optional["Floor"]] = relationship("Floor", back_populates="rooms")

    def __repr__(self) -> str:
        return f"<Room(id={self.id}, name={self.name}, room_type={self.room_type})>"
