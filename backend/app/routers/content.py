"""Public promotion, hero, and showroom endpoints."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import HeroBanner, PromoMessage, Showroom


router = APIRouter(prefix="/api", tags=["content"])


@router.get("/promos")
def get_promos(db: Session = Depends(get_db)) -> list[str]:
    messages = db.scalars(
        select(PromoMessage)
        .where(PromoMessage.is_active.is_(True))
        .order_by(PromoMessage.sort_order, PromoMessage.id)
    ).all()

    return [message.text for message in messages]


@router.get("/hero")
def get_hero(db: Session = Depends(get_db)) -> dict[str, Any]:
    hero = db.scalar(
        select(HeroBanner)
        .where(HeroBanner.is_active.is_(True))
        .order_by(HeroBanner.id)
        .limit(1)
    )

    if hero is None:
        raise HTTPException(status_code=404, detail="No active hero banner found")

    return {
        "eyebrow": None,
        "headlineDesktop": hero.headline_desktop,
        "headlineMobile": hero.headline_mobile,
        "subtext": hero.subtext,
        "ctaLabelDesktop": hero.cta_label,
        "ctaLabelMobile": hero.cta_label,
        "ctaPath": hero.cta_url,
        "badge": None,
        "imageDesktop": hero.image_url_desktop,
        "imageMobile": hero.image_url_mobile,
        "imageAlt": hero.headline_mobile,
    }


@router.get("/showrooms")
def get_showrooms(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    showrooms = db.scalars(
        select(Showroom).order_by(Showroom.sort_order, Showroom.name)
    ).all()

    return [
        {
            "id": str(showroom.id),
            "name": showroom.name,
            "city": showroom.city,
            "address": showroom.address,
            "phone": showroom.phone,
            "whatsappNumber": showroom.whatsapp_number,
            "openingHours": showroom.opening_hours,
            "mapUrl": showroom.map_url,
            "sortOrder": showroom.sort_order,
        }
        for showroom in showrooms
    ]