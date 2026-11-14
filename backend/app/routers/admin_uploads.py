"""Secure Cloudinary upload signatures for authenticated admins."""

import hashlib
import time
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict

from app.config import settings
from app.security import get_current_admin


router = APIRouter(prefix="/api/admin/uploads", tags=["admin-uploads"])


class UploadSignatureRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    purpose: Literal["products", "hero", "categories"]


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