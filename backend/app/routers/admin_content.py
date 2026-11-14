"""Admin editing for category hierarchy and the homepage hero."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.catalog import Category, Product
from app.models.content import HeroBanner
from app.schemas.admin_content import (
    AdminCategoryCreate,
    AdminCategoryResponse,
    AdminCategoryUpdate,
    AdminHeroResponse,
    AdminHeroUpdate,
)
from app.security import get_current_admin, require_admin_role


router = APIRouter(prefix="/api/admin/content", tags=["admin-content"])


def _category_or_404(db: Session, category_id: UUID) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


def _parent_or_422(db: Session, parent_slug: str | None) -> Category | None:
    if not parent_slug:
        return None

    parent = db.scalar(select(Category).where(Category.slug == parent_slug))
    if parent is None:
        raise HTTPException(status_code=422, detail="Parent category not found")

    if parent.parent_id is not None:
        raise HTTPException(
            status_code=422,
            detail="A subcategory cannot be used as a parent",
        )

    return parent


def _category_payload(db: Session, category: Category) -> dict:
    parent = db.get(Category, category.parent_id) if category.parent_id else None

    return {
        "id": str(category.id),
        "name": category.name,
        "slug": category.slug,
        "blurb": category.blurb,
        "imageUrl": category.image_url,
        "parentId": str(category.parent_id) if category.parent_id else None,
        "parentSlug": parent.slug if parent else None,
        "parentName": parent.name if parent else None,
        "sortOrder": category.sort_order,
    }


@router.get("/categories", response_model=list[AdminCategoryResponse])
def list_categories(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> list[dict]:
    categories = db.scalars(
        select(Category).order_by(Category.sort_order, Category.name)
    ).all()
    return [_category_payload(db, category) for category in categories]


@router.post(
    "/categories",
    status_code=status.HTTP_201_CREATED,
    response_model=AdminCategoryResponse,
)
def create_category(
    payload: AdminCategoryCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    existing = db.scalar(select(Category.id).where(Category.slug == payload.slug))
    if existing:
        raise HTTPException(status_code=409, detail="That category slug is already in use")

    parent = _parent_or_422(db, payload.parent_slug)

    category = Category(
        name=payload.name,
        slug=payload.slug,
        blurb=payload.blurb,
        image_url=payload.image_url,
        parent_id=parent.id if parent else None,
        sort_order=payload.sort_order,
    )

    db.add(category)
    db.commit()
    db.refresh(category)
    return _category_payload(db, category)


@router.patch(
    "/categories/{category_id}",
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

    for required_field in ("name", "slug", "sort_order"):
        if required_field in values and values[required_field] is None:
            raise HTTPException(
                status_code=422,
                detail=f"{required_field} cannot be null",
            )

    if "slug" in values:
        duplicate = db.scalar(
            select(Category.id).where(
                Category.slug == values["slug"],
                Category.id != category.id,
            )
        )
        if duplicate:
            raise HTTPException(
                status_code=409,
                detail="That category slug is already in use",
            )
        category.slug = values.pop("slug")

    if "parent_slug" in values:
        requested_parent_slug = values.pop("parent_slug")

        # A top-level category may have subcategories. Moving it under another
        # category would create a third hierarchy level, which the storefront
        # menu and product filters do not support.
        if category.parent_id is None and requested_parent_slug:
            has_children = db.scalar(
                select(Category.id)
                .where(Category.parent_id == category.id)
                .limit(1)
            )
            if has_children:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "Move its subcategories to another top-level category "
                        "before making this category a subcategory"
                    ),
                )

        parent = _parent_or_422(db, requested_parent_slug)
        if parent and parent.id == category.id:
            raise HTTPException(
                status_code=422,
                detail="A category cannot be its own parent",
            )
        category.parent_id = parent.id if parent else None

    for field in ("name", "blurb", "image_url", "sort_order"):
        if field in values:
            setattr(category, field, values[field])

    db.commit()
    db.refresh(category)
    return _category_payload(db, category)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin_role),
) -> Response:
    category = _category_or_404(db, category_id)

    has_children = db.scalar(
        select(Category.id)
        .where(Category.parent_id == category.id)
        .limit(1)
    )
    if has_children:
        raise HTTPException(
            status_code=409,
            detail="Move or delete its subcategories before deleting this category",
        )

    has_products = db.scalar(
        select(Product.id)
        .where(Product.category_id == category.id)
        .limit(1)
    )
    if has_products:
        raise HTTPException(
            status_code=409,
            detail="Move its products to another category before deleting it",
        )

    db.delete(category)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


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
        "isActive": hero.is_active,
    }


@router.get("/hero", response_model=AdminHeroResponse | None)
def get_admin_hero(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict | None:
    hero = db.scalar(
        select(HeroBanner)
        .where(HeroBanner.is_active.is_(True))
        .order_by(HeroBanner.id)
        .limit(1)
    )

    if hero is None:
        hero = db.scalar(select(HeroBanner).order_by(HeroBanner.id).limit(1))

    return _hero_payload(hero) if hero else None


@router.put("/hero", response_model=AdminHeroResponse)
def save_admin_hero(
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
        hero.is_active = payload.is_active

    if payload.is_active:
        other_heroes = db.scalars(
            select(HeroBanner).where(HeroBanner.id != hero.id)
        ).all()
        for other in other_heroes:
            other.is_active = False

    db.commit()
    db.refresh(hero)
    return _hero_payload(hero)
