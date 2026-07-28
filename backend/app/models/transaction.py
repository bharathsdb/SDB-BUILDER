import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, DateTime, ForeignKey, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    status: Mapped[str] = mapped_column(String(20), default="PENDING", nullable=False, index=True)
    order_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    txn_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True, index=True)
    gateway_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    payment_mode: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    resp_msg: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    plan_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    payment_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="transactions")
    subscription: Mapped[Optional["Subscription"]] = relationship("Subscription", back_populates="transactions")

    __table_args__ = (
        Index("ix_transactions_order_txn_user_status", "order_id", "txn_id", "user_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, order_id={self.order_id}, status={self.status})>"
