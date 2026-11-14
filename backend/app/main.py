"""FastAPI application, CORS policy, and health endpoint."""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.routers import admin_content, admin_products, admin_auth, catalog, content, subscribers, admin_uploads

is_development = settings.environment.lower() == "development"

app = FastAPI(
    title=settings.app_name,
    docs_url="/docs" if is_development else None,
    redoc_url="/redoc" if is_development else None,
    openapi_url="/openapi.json" if is_development else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router)
app.include_router(content.router)
app.include_router(subscribers.router)
app.include_router(admin_auth.router)
app.include_router(admin_products.router)
app.include_router(admin_uploads.router)
app.include_router(admin_content.router)


@app.get("/health")
def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}