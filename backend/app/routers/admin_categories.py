"""Admin category management endpoints."""

import re
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.catalog import Category, Product
from app.routers.admin_uploads import (
    delete_cloudinary_asset,
    is_cloudinary_asset_referenced,
)
from app.schemas.admin_categories import (
    AdminCategoryCreate,
    AdminCategoryResponse,
    AdminCategoryUpdate,
)
from app.security import get_current_admin, require_admin_role

router = APIRouter(prefix="/api/admin/categories", tags=["admin-categories"])


def _category_or_404(db: Session, category_id: UUID) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


def _slugify(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower()
    return cleaned or "category"


def _category_payload(category: Category) -> dict:
    return {
        "id": str(category.id),
        "name": category.name,
        "slug": category.slug,
        "parentId": str(category.parent_id) if category.parent_id else None,
        "sortOrder": category.sort_order,
        "imageUrl": category.image_url,
        "cloudinaryPublicId": category.cloudinary_public_id,
        "blurb": category.blurb,
        "featuredProductId": (
            str(category.featured_product_id)
            if category.featured_product_id
            else None
        ),
    }


@router.get("", response_model=list[AdminCategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> list[dict]:
    categories = db.scalars(
        select(Category).order_by(Category.sort_order, Category.name)
    ).all()
    return [_category_payload(category) for category in categories]


@router.get("/{category_id}", response_model=AdminCategoryResponse)
def get_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    return _category_payload(_category_or_404(db, category_id))


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=AdminCategoryResponse,
)
def create_category(
    payload: AdminCategoryCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    slug = payload.slug or _slugify(payload.name)

    existing = db.scalar(select(Category.id).where(Category.slug == slug))
    if existing:
        raise HTTPException(
            status_code=409,
            detail="A category with this slug already exists.",
        )

    resolved_parent_id = payload.parent_id
    if resolved_parent_id is None and payload.parent_slug:
        parent = db.scalar(select(Category).where(Category.slug == payload.parent_slug))
        if parent is None:
            raise HTTPException(status_code=422, detail="Parent category not found")
        resolved_parent_id = parent.id
    elif resolved_parent_id is not None:
        parent = db.get(Category, resolved_parent_id)
        if parent is None:
            raise HTTPException(status_code=422, detail="Parent category not found")

    if payload.featured_product_id is not None:
        product = db.get(Product, payload.featured_product_id)
        if product is None:
            raise HTTPException(status_code=422, detail="Featured product not found")

    category = Category(
        name=payload.name,
        slug=slug,
        parent_id=resolved_parent_id,
        sort_order=payload.sort_order,
        image_url=payload.image_url,
        cloudinary_public_id=payload.cloudinary_public_id,
        blurb=payload.blurb,
        featured_product_id=payload.featured_product_id,
    )

    db.add(category)
    db.commit()
    db.refresh(category)
    return _category_payload(category)


@router.patch(
    "/{category_id}",
    response_model=AdminCategoryResponse,
)
def update_category(
    category_id: UUID,
    payload: AdminCategoryUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    category = _category_or_404(db, category_id)
    values = payload.model_dump(exclude_unset=True)

    if "name" in values and values["name"] is None:
        raise HTTPException(status_code=422, detail="Category name cannot be null")

    if "slug" in values:
        new_slug = values["slug"]
        if new_slug is None:
            raise HTTPException(status_code=422, detail="Category slug cannot be null")
        if new_slug != category.slug:
            existing = db.scalar(
                select(Category.id).where(
                    Category.slug == new_slug,
                    Category.id != category.id,
                )
            )
            if existing:
                raise HTTPException(
                    status_code=409,
                    detail="A category with this slug already exists.",
                )
            category.slug = new_slug

    if "parent_id" in values or "parent_slug" in values:
        if "parent_id" in values:
            new_parent_id = values["parent_id"]
        else:
            pslug = values["parent_slug"]
            if pslug:
                parent = db.scalar(select(Category).where(Category.slug == pslug))
                if parent is None:
                    raise HTTPException(status_code=422, detail="Parent category not found")
                new_parent_id = parent.id
            else:
                new_parent_id = None

        if new_parent_id is not None:
            if new_parent_id == category.id:
                raise HTTPException(
                    status_code=422,
                    detail="A category cannot be its own parent",
                )
            # Check for loops
            curr = new_parent_id
            visited = {category.id}
            while curr is not None:
                if curr in visited:
                    raise HTTPException(
                        status_code=422,
                        detail="Category parent would create a loop",
                    )
                visited.add(curr)
                parent_record = db.get(Category, curr)
                if parent_record is None:
                    raise HTTPException(
                        status_code=422,
                        detail="Parent category not found",
                    )
                curr = parent_record.parent_id
            category.parent_id = new_parent_id
        else:
            category.parent_id = None

    if "featured_product_id" in values:
        new_product_id = values["featured_product_id"]
        if new_product_id is not None:
            product = db.get(Product, new_product_id)
            if product is None:
                raise HTTPException(
                    status_code=422,
                    detail="Featured product not found",
                )
            category.featured_product_id = new_product_id
        else:
            category.featured_product_id = None

    old_public_id = category.cloudinary_public_id

    for field in ("name", "sort_order", "image_url", "cloudinary_public_id", "blurb"):
        if field in values:
            setattr(category, field, values[field])

    db.commit()
    db.refresh(category)

    if (
        old_public_id
        and old_public_id != category.cloudinary_public_id
        and not is_cloudinary_asset_referenced(db, old_public_id)
    ):
        delete_cloudinary_asset(old_public_id)

    return _category_payload(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin_role),
) -> Response:
    category = _category_or_404(db, category_id)

    has_children = db.scalar(
        select(Category.id).where(Category.parent_id == category.id).limit(1)
    )
    has_products = db.scalar(
        select(Product.id).where(Product.category_id == category.id).limit(1)
    )

    if has_children or has_products:
        raise HTTPException(
            status_code=409,
            detail="Move or delete its products and subcategories first.",
        )

    old_public_id = category.cloudinary_public_id
    db.delete(category)
    db.commit()

    if old_public_id and not is_cloudinary_asset_referenced(db, old_public_id):
        delete_cloudinary_asset(old_public_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
