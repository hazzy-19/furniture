"""Public website content models."""

from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import Boolean, Integer, JSON, String, Text, Uuid, text as sql_text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Showroom(Base):
    __tablename__ = "showrooms"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    area: Mapped[str] = mapped_column(
        String(200), nullable=False, default="", server_default=sql_text("''")
    )
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    whatsapp_number: Mapped[str] = mapped_column(String(50), nullable=False)
    opening_hours: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON, nullable=False, default=list, server_default=sql_text("'[]'::json")
    )
    map_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    sort_order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default=sql_text("0")
    )


class PromoMessage(Base):
    __tablename__ = "promo_messages"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    text: Mapped[str] = mapped_column(String(500), nullable=False)
    sort_order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default=sql_text("0")
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=sql_text("true")
    )


class HeroBanner(Base):
    __tablename__ = "hero_banners"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    eyebrow: Mapped[str | None] = mapped_column(String(200), nullable=True)
    headline_desktop: Mapped[str] = mapped_column(String(300), nullable=False)
    headline_mobile: Mapped[str] = mapped_column(String(300), nullable=False)
    subtext: Mapped[str | None] = mapped_column(Text, nullable=True)
    cta_label: Mapped[str] = mapped_column(String(120), nullable=False)
    cta_label_mobile: Mapped[str] = mapped_column(
        String(120), nullable=False, default="Shop now", server_default=sql_text("'Shop now'")
    )
    cta_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    badge: Mapped[str | None] = mapped_column(String(100), nullable=True)
    image_url_desktop: Mapped[str] = mapped_column(String(2048), nullable=False)
    image_url_mobile: Mapped[str] = mapped_column(String(2048), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=sql_text("true")
    )