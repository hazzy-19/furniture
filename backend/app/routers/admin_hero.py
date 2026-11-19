"""Admin homepage hero banner management endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import HeroBanner
from app.routers.admin_uploads import (
    delete_cloudinary_asset,
    is_cloudinary_asset_referenced,
)
from app.schemas.admin_hero import AdminHeroResponse, AdminHeroUpdate
from app.security import get_current_admin

router = APIRouter(prefix="/api/admin/hero", tags=["admin-hero"])


def _hero_payload(hero: HeroBanner) -> dict:
    return {
        "id": str(hero.id),
        "eyebrow": hero.eyebrow,
        "headlineDesktop": hero.headline_desktop,
        "headlineMobile": hero.headline_mobile,
        "subtext": hero.subtext,
        "ctaLabelDesktop": hero.cta_label,
        "ctaLabelMobile": hero.cta_label_mobile,
        "ctaPath": hero.cta_url,
        "badge": hero.badge,
        "imageDesktop": hero.image_url_desktop,
        "imageMobile": hero.image_url_mobile,
        "imageAlt": hero.headline_mobile,
        "cloudinaryPublicIdDesktop": hero.cloudinary_public_id_desktop,
        "cloudinaryPublicIdMobile": hero.cloudinary_public_id_mobile,
        "isActive": hero.is_active,
    }


@router.get("", response_model=AdminHeroResponse)
def get_hero(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    hero = db.scalar(
        select(HeroBanner)
        .where(HeroBanner.is_active.is_(True))
        .order_by(HeroBanner.id)
        .limit(1)
    )

    if hero is None:
        hero = db.scalar(select(HeroBanner).order_by(HeroBanner.id).limit(1))

    if hero is None:
        raise HTTPException(status_code=404, detail="Hero not found")

    return _hero_payload(hero)


@router.put("", response_model=AdminHeroResponse)
def replace_hero(
    payload: AdminHeroUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    hero = db.scalar(
        select(HeroBanner)
        .where(HeroBanner.is_active.is_(True))
        .order_by(HeroBanner.id)
        .limit(1)
    )

    if hero is None:
        hero = db.scalar(select(HeroBanner).order_by(HeroBanner.id).limit(1))

    old_desktop_pid = hero.cloudinary_public_id_desktop if hero else None
    old_mobile_pid = hero.cloudinary_public_id_mobile if hero else None

    if hero is None:
        hero = HeroBanner(
            eyebrow=payload.eyebrow,
            headline_desktop=payload.headline_desktop,
            headline_mobile=payload.headline_mobile,
            subtext=payload.subtext,
            cta_label=payload.cta_label_desktop,
            cta_label_mobile=payload.cta_label_mobile,
            cta_url=payload.cta_path,
            badge=payload.badge,
            image_url_desktop=payload.image_desktop,
            image_url_mobile=payload.image_mobile,
            cloudinary_public_id_desktop=payload.cloudinary_public_id_desktop,
            cloudinary_public_id_mobile=payload.cloudinary_public_id_mobile,
            is_active=payload.is_active,
        )
        db.add(hero)
    else:
        hero.eyebrow = payload.eyebrow
        hero.headline_desktop = payload.headline_desktop
        hero.headline_mobile = payload.headline_mobile
        hero.subtext = payload.subtext
        hero.cta_label = payload.cta_label_desktop
        hero.cta_label_mobile = payload.cta_label_mobile
        hero.cta_url = payload.cta_path
        hero.badge = payload.badge
        hero.image_url_desktop = payload.image_desktop
        hero.image_url_mobile = payload.image_mobile
        hero.cloudinary_public_id_desktop = payload.cloudinary_public_id_desktop
        hero.cloudinary_public_id_mobile = payload.cloudinary_public_id_mobile
        hero.is_active = payload.is_active

    if payload.is_active:
        other_heroes = db.scalars(
            select(HeroBanner).where(HeroBanner.id != hero.id)
        ).all()
        for other in other_heroes:
            other.is_active = False

    db.commit()
    db.refresh(hero)

    if (
        old_desktop_pid
        and old_desktop_pid != hero.cloudinary_public_id_desktop
        and not is_cloudinary_asset_referenced(db, old_desktop_pid)
    ):
        delete_cloudinary_asset(old_desktop_pid)

    if (
        old_mobile_pid
        and old_mobile_pid != hero.cloudinary_public_id_mobile
        and not is_cloudinary_asset_referenced(db, old_mobile_pid)
    ):
        delete_cloudinary_asset(old_mobile_pid)

    return _hero_payload(hero)
