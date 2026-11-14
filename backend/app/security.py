"""Security, password hashing, JWT sessions, and admin dependencies."""

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, Request, Response, status
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.admin import AdminUser
from app.models.enums import AdminRole

COOKIE_NAME = "aurelle_admin"

# Password hasher using Argon2
password_hash = PasswordHash((Argon2Hasher(),))

# Pre-computed dummy hash to prevent timing attacks on unknown emails during login
DUMMY_PASSWORD_HASH = password_hash.hash("aurelle-home-timing-dummy-secret")


def hash_password(password: str) -> str:
    """Hash a plaintext password using Argon2."""
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against an Argon2 hash."""
    try:
        return password_hash.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(admin_id: str | UUID, role: str) -> str:
    """Create a signed JWT session token."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(admin_id),
        "role": str(role),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a signed JWT session token."""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None


def set_admin_cookie(response: Response, token: str) -> None:
    """Set the signed JWT session in an httpOnly cookie."""
    max_age_seconds = settings.access_token_expire_minutes * 60
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=max_age_seconds,
        expires=max_age_seconds,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        path="/",
    )


def clear_admin_cookie(response: Response) -> None:
    """Clear the admin session cookie."""
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        path="/",
    )


def get_current_admin(
    request: Request,
    db: Session = Depends(get_db),
) -> AdminUser:
    """Dependency that reads the admin cookie, decodes JWT, and returns AdminUser."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        admin_id = UUID(payload["sub"])
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    admin = db.get(AdminUser, admin_id)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    return admin


def require_admin_role(
    current_admin: AdminUser = Depends(get_current_admin),
) -> AdminUser:
    """Dependency ensuring the authenticated admin has the 'admin' role (not editor)."""
    if current_admin.role != AdminRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )
    return current_admin

