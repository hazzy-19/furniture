"""Admin promo message management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import PromoMessage
from app.schemas.admin_promos import (
    AdminPromoCreate,
    AdminPromoResponse,
    AdminPromoUpdate,
)
from app.security import get_current_admin, require_admin_role

router = APIRouter(prefix="/api/admin/promos", tags=["admin-promos"])


def _promo_or_404(db: Session, promo_id: UUID) -> PromoMessage:
    promo = db.get(PromoMessage, promo_id)
    if promo is None:
        raise HTTPException(status_code=404, detail="Promo not found")
    return promo


def _promo_payload(promo: PromoMessage) -> dict:
    return {
        "id": str(promo.id),
        "text": promo.text,
        "sortOrder": promo.sort_order,
        "isActive": promo.is_active,
    }


@router.get("", response_model=list[AdminPromoResponse])
def list_promos(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> list[dict]:
    promos = db.scalars(
        select(PromoMessage).order_by(PromoMessage.sort_order, PromoMessage.id)
    ).all()
    return [_promo_payload(promo) for promo in promos]


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=AdminPromoResponse,
)
def create_promo(
    payload: AdminPromoCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    promo = PromoMessage(
        text=payload.text.strip(),
        sort_order=payload.sort_order,
        is_active=payload.is_active,
    )

    db.add(promo)
    db.commit()
    db.refresh(promo)
    return _promo_payload(promo)


@router.patch(
    "/{promo_id}",
    response_model=AdminPromoResponse,
)
def update_promo(
    promo_id: UUID,
    payload: AdminPromoUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    promo = _promo_or_404(db, promo_id)
    values = payload.model_dump(exclude_unset=True)

    if "text" in values:
        if values["text"] is None or not str(values["text"]).strip():
            raise HTTPException(status_code=422, detail="Text cannot be empty")
        promo.text = str(values["text"]).strip()

    if "sort_order" in values and values["sort_order"] is not None:
        promo.sort_order = values["sort_order"]

    if "is_active" in values and values["is_active"] is not None:
        promo.is_active = values["is_active"]

    db.commit()
    db.refresh(promo)
    return _promo_payload(promo)


@router.delete("/{promo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_promo(
    promo_id: UUID,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin_role),
) -> Response:
    promo = _promo_or_404(db, promo_id)
    db.delete(promo)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
