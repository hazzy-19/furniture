"""Admin authentication router: login, logout, and current user info."""

import time
from collections import defaultdict
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import AdminUser
from app.schemas.admin_auth import AdminLoginRequest, AdminMeResponse
from app.security import (
    DUMMY_PASSWORD_HASH,
    clear_admin_cookie,
    create_access_token,
    get_current_admin,
    set_admin_cookie,
    verify_password,
)

router = APIRouter(prefix="/api/admin", tags=["admin-auth"])


# In-memory rate limiter: at most 5 failed attempts per 15 minutes per (client IP + email).
# Note: This in-memory state resets on process restart and is per process.
class LoginRateLimiter:
    def __init__(self, max_attempts: int = 5, window_seconds: int = 900) -> None:
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._attempts: dict[tuple[str, str], list[float]] = defaultdict(list)

    def is_rate_limited(self, ip: str, email: str) -> bool:
        now = time.time()
        cutoff = now - self.window_seconds
        key = (ip, email)
        valid = [t for t in self._attempts[key] if t > cutoff]
        self._attempts[key] = valid
        return len(valid) >= self.max_attempts

    def record_failure(self, ip: str, email: str) -> None:
        now = time.time()
        cutoff = now - self.window_seconds
        key = (ip, email)
        valid = [t for t in self._attempts[key] if t > cutoff]
        valid.append(now)
        self._attempts[key] = valid

    def reset(self, ip: str, email: str) -> None:
        key = (ip, email)
        self._attempts.pop(key, None)


rate_limiter = LoginRateLimiter(max_attempts=5, window_seconds=900)


@router.post("/login", response_model=AdminMeResponse)
def login(
    payload: AdminLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> Any:
    client_ip = request.client.host if request.client else "127.0.0.1"
    normalized_email = payload.email.strip().lower()

    # Enforce in-memory rate limiting
    if rate_limiter.is_rate_limited(client_ip, normalized_email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again later.",
        )

    admin = db.scalar(select(AdminUser).where(AdminUser.email == normalized_email))

    if admin is None:
        # Constant-time dummy verification prevents timing attacks on unknown emails
        verify_password(payload.password, DUMMY_PASSWORD_HASH)
        rate_limiter.record_failure(client_ip, normalized_email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(payload.password, admin.password_hash):
        rate_limiter.record_failure(client_ip, normalized_email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Reset rate limiting counter on successful login
    rate_limiter.reset(client_ip, normalized_email)

    token = create_access_token(admin.id, admin.role.value)
    set_admin_cookie(response, token)

    return {
        "id": str(admin.id),
        "email": admin.email,
        "role": admin.role.value,
    }


@router.post("/logout")
def logout(response: Response) -> dict[str, Any]:
    clear_admin_cookie(response)
    return {"ok": True, "message": "Logged out successfully"}


@router.get("/me", response_model=AdminMeResponse)
def get_me(current_admin: AdminUser = Depends(get_current_admin)) -> Any:
    return {
        "id": str(current_admin.id),
        "email": current_admin.email,
        "role": current_admin.role.value,
    }

