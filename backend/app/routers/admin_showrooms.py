"""Admin showrooms management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import Showroom
from app.schemas.admin_showrooms import (
    AdminShowroomCreate,
    AdminShowroomResponse,
    AdminShowroomUpdate,
)
from app.security import get_current_admin, require_admin_role

router = APIRouter(prefix="/api/admin/showrooms", tags=["admin-showrooms"])


def _showroom_or_404(db: Session, showroom_id: UUID) -> Showroom:
    showroom = db.get(Showroom, showroom_id)
    if showroom is None:
        raise HTTPException(status_code=404, detail="Showroom not found")
    return showroom


def _showroom_payload(showroom: Showroom) -> dict:
    return {
        "id": str(showroom.id),
        "city": showroom.city,
        "area": showroom.area,
        "name": showroom.name,
        "address": showroom.address,
        "phone": showroom.phone,
        "whatsappNumber": showroom.whatsapp_number,
        "mapUrl": showroom.map_url,
        "sortOrder": showroom.sort_order,
        "hours": showroom.opening_hours,
    }


@router.get("", response_model=list[AdminShowroomResponse])
def list_showrooms(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> list[dict]:
    showrooms = db.scalars(
        select(Showroom).order_by(Showroom.sort_order, Showroom.name)
    ).all()
    return [_showroom_payload(showroom) for showroom in showrooms]


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=AdminShowroomResponse,
)
def create_showroom(
    payload: AdminShowroomCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    name = (
        payload.name.strip()
        if payload.name and payload.name.strip()
        else f"{payload.city} Showroom"
    )
    address = (
        payload.address.strip()
        if payload.address and payload.address.strip()
        else payload.area.strip()
    )

    showroom = Showroom(
        city=payload.city.strip(),
        area=payload.area.strip(),
        name=name,
        address=address,
        phone=payload.phone.strip(),
        whatsapp_number=payload.whatsapp_number,
        map_url=payload.map_url.strip() if payload.map_url else None,
        sort_order=payload.sort_order,
        opening_hours=[hour.model_dump() for hour in payload.hours],
    )

    db.add(showroom)
    db.commit()
    db.refresh(showroom)
    return _showroom_payload(showroom)


@router.patch(
    "/{showroom_id}",
    response_model=AdminShowroomResponse,
)
def update_showroom(
    showroom_id: UUID,
    payload: AdminShowroomUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    showroom = _showroom_or_404(db, showroom_id)
    values = payload.model_dump(exclude_unset=True)

    required_non_null = {"city", "area", "phone", "whatsapp_number", "hours"}
    for field in required_non_null:
        if field in values and values[field] is None:
            raise HTTPException(
                status_code=422,
                detail=f"{field} cannot be null",
            )

    if "city" in values:
        showroom.city = values["city"].strip()
    if "area" in values:
        showroom.area = values["area"].strip()
    if "name" in values:
        showroom.name = (
            values["name"].strip()
            if values["name"] and values["name"].strip()
            else f"{showroom.city} Showroom"
        )
    if "address" in values:
        showroom.address = (
            values["address"].strip()
            if values["address"] and values["address"].strip()
            else showroom.area
        )
    if "phone" in values:
        showroom.phone = values["phone"].strip()
    if "whatsapp_number" in values:
        showroom.whatsapp_number = values["whatsapp_number"]
    if "map_url" in values:
        showroom.map_url = (
            values["map_url"].strip() if values["map_url"] else None
        )
    if "sort_order" in values and values["sort_order"] is not None:
        showroom.sort_order = values["sort_order"]
    if "hours" in values and values["hours"] is not None:
        showroom.opening_hours = [
            hour.model_dump() if hasattr(hour, "model_dump") else hour
            for hour in values["hours"]
        ]

    db.commit()
    db.refresh(showroom)
    return _showroom_payload(showroom)


@router.delete("/{showroom_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_showroom(
    showroom_id: UUID,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin_role),
) -> Response:
    showroom = _showroom_or_404(db, showroom_id)
    db.delete(showroom)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
