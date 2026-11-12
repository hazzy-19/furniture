"""Subscriber, favorite, and notification log models."""

import secrets
from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, validates

from app.database import Base
from app.models.enums import NotificationStatus, NotificationType, enum_column_type


class Subscriber(Base):
    __tablename__ = "subscribers"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    consent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    consent_source: Mapped[str] = mapped_column(String(255), nullable=False)
    wants_new_arrivals: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    wants_hot_items: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    wants_low_stock: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    unsubscribe_token: Mapped[str] = mapped_column(
        String(128), unique=True, nullable=False, default=lambda: secrets.token_urlsafe(32)
    )
    unsubscribed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    @validates("email")
    def normalize_email(self, _key: str, value: str) -> str:
        return value.strip().lower()


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("subscriber_id", "product_id"),)

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    subscriber_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("subscribers.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    low_stock_notified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    subscriber_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("subscribers.id"), nullable=False
    )
    product_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("products.id"), nullable=True
    )
    type: Mapped[NotificationType] = mapped_column(
        enum_column_type(NotificationType, "notification_type"), nullable=False
    )
    status: Mapped[NotificationStatus] = mapped_column(
        enum_column_type(NotificationStatus, "notification_status"),
        nullable=False,
        default=NotificationStatus.QUEUED,
        server_default=text("'queued'"),
    )
    provider_message_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
