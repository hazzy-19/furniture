"""Secure Cloudinary upload signatures and asset management for authenticated admins."""

import hashlib
import json
import logging
import time
import urllib.parse
import urllib.request
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.catalog import Category, ProductImage
from app.models.content import HeroBanner
from app.security import get_current_admin


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/uploads", tags=["admin-uploads"])


class UploadSignatureRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purpose: Literal["products", "hero", "categories"]


class DestroyAssetRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    public_id: str = Field(alias="publicId", min_length=1)


def is_cloudinary_asset_referenced(db: Session, public_id: str) -> bool:
    """Check whether a Cloudinary public ID is still referenced by catalog or content rows."""
    if not public_id:
        return False

    has_product_image = db.scalar(
        select(ProductImage.id)
        .where(ProductImage.cloudinary_public_id == public_id)
        .limit(1)
    )
    if has_product_image is not None:
        return True

    has_category = db.scalar(
        select(Category.id)
        .where(Category.cloudinary_public_id == public_id)
        .limit(1)
    )
    if has_category is not None:
        return True

    has_hero = db.scalar(
        select(HeroBanner.id)
        .where(
            or_(
                HeroBanner.cloudinary_public_id_desktop == public_id,
                HeroBanner.cloudinary_public_id_mobile == public_id,
            )
        )
        .limit(1)
    )
    return has_hero is not None


def delete_cloudinary_asset(public_id: str) -> bool:
    """Securely destroy an asset in Cloudinary using backend credentials only."""
    if not public_id:
        return False

    cloud_name = settings.cloudinary_cloud_name
    api_key = settings.cloudinary_api_key
    api_secret = settings.cloudinary_api_secret

    if not cloud_name or not api_key or not api_secret:
        logger.warning(
            "Cloudinary credentials not configured; skipped deleting asset '%s'",
            public_id,
        )
        return False

    timestamp = int(time.time())
    params = {"public_id": public_id, "timestamp": timestamp}
    to_sign = f"public_id={public_id}&timestamp={timestamp}{api_secret}"
    signature = hashlib.sha1(to_sign.encode("utf-8")).hexdigest()

    data = urllib.parse.urlencode(
        {
            "public_id": public_id,
            "timestamp": str(timestamp),
            "api_key": api_key,
            "signature": signature,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        f"https://api.cloudinary.com/v1_1/{cloud_name}/image/destroy",
        data=data,
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            result = body.get("result")
            # Result is 'ok' on successful delete, or 'not found' if already gone.
            return result in ("ok", "not found")
    except Exception as exc:
        logger.error(
            "Failed to delete Cloudinary asset '%s': %s",
            public_id,
            exc,
        )
        return False


@router.post("/signature")
def create_upload_signature(
    payload: UploadSignatureRequest,
    _admin=Depends(get_current_admin),
) -> dict[str, str | int]:
    cloud_name = settings.cloudinary_cloud_name
    api_key = settings.cloudinary_api_key
    api_secret = settings.cloudinary_api_secret

    if not cloud_name or not api_key or not api_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image uploads are not configured",
        )

    folders = {
        "products": "aurelle/products",
        "hero": "aurelle/hero",
        "categories": "aurelle/categories",
    }

    timestamp = int(time.time())
    folder = folders[payload.purpose]
    params = {"folder": folder, "timestamp": timestamp}
    to_sign = "&".join(f"{key}={params[key]}" for key in sorted(params))
    signature = hashlib.sha1(
        f"{to_sign}{api_secret}".encode("utf-8")
    ).hexdigest()

    return {
        "cloudName": cloud_name,
        "apiKey": api_key,
        "timestamp": timestamp,
        "folder": folder,
        "signature": signature,
    }


@router.post("/destroy")
def destroy_upload_asset(
    payload: DestroyAssetRequest,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict[str, Any]:
    """Authenticated endpoint to delete a Cloudinary asset if unreferenced."""
    if is_cloudinary_asset_referenced(db, payload.public_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Asset is still referenced by other catalog records",
        )

    success = delete_cloudinary_asset(payload.public_id)
    return {"success": success, "publicId": payload.public_id}
