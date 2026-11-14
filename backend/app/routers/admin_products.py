import re
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.catalog import Category, Product, ProductImage
from app.models.enums import ProductStatus
from app.models.orders import OrderItem
from app.schemas.admin_products import (
    AdminProductCreate,
    AdminProductImageCreate,
    AdminProductImageUpdate,
    AdminProductUpdate,
)
from app.security import get_current_admin


router = APIRouter(prefix="/api/admin", tags=["admin-products"])


def _product_or_404(db: Session, product_id: UUID) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def _category_or_404(db: Session, slug: str) -> Category:
    category = db.scalar(select(Category).where(Category.slug == slug))
    if category is None:
        raise HTTPException(status_code=422, detail="Category not found")
    return category


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "product"


def _available_slug(
    db: Session,
    requested_slug: str | None,
    product_name: str,
    *,
    exclude_id: UUID | None = None,
) -> str:
    raw_slug = requested_slug.strip() if requested_slug else ""
    base_slug = _slugify(raw_slug or product_name)
    candidate = base_slug
    suffix = 2

    while True:
        query = select(Product.id).where(Product.slug == candidate)
        if exclude_id is not None:
            query = query.where(Product.id != exclude_id)

        if db.scalar(query) is None:
            return candidate

        if raw_slug:
            raise HTTPException(status_code=409, detail="That product slug is already in use")

        candidate = f"{base_slug}-{suffix}"
        suffix += 1


def _image_payload(image: ProductImage) -> dict:
    return {
        "id": str(image.id),
        "url": image.url,
        "alt": image.alt,
        "sortOrder": image.sort_order,
        "isPrimary": image.is_primary,
    }


def _product_payload(db: Session, product: Product) -> dict:
    category = db.get(Category, product.category_id)
    images = db.scalars(
        select(ProductImage)
        .where(ProductImage.product_id == product.id)
        .order_by(ProductImage.is_primary.desc(), ProductImage.sort_order)
    ).all()

    primary_image = next((image for image in images if image.is_primary), None)
    room = db.get(Category, category.parent_id) if category and category.parent_id else category

    return {
        "id": str(product.id),
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "priceKes": product.price_kes,
        "compareAtPriceKes": product.compare_at_price_kes,
        "category": category.slug if category else None,
        "categorySlug": category.slug if category else None,
        "room": room.slug if room else None,
        "material": product.material,
        "color": product.color,
        "widthCm": product.width_cm,
        "depthCm": product.depth_cm,
        "heightCm": product.height_cm,
        "isHot": product.is_hot,
        "badge": "hot" if product.is_hot else None,
        "status": product.status.value,
        "stock": product.stock_quantity,
        "lowStockThreshold": product.low_stock_threshold,
        "publishedAt": product.published_at,
        "image": primary_image.url if primary_image else None,
        "images": [_image_payload(image) for image in images],
    }


@router.get("/products")
def list_products(
    status_filter: ProductStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, max_length=100),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> list[dict]:
    query = select(Product)

    if status_filter is not None:
        query = query.where(Product.status == status_filter)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Product.name.ilike(search_term),
                Product.slug.ilike(search_term),
            )
        )

    products = db.scalars(query.order_by(Product.created_at.desc())).all()
    return [_product_payload(db, product) for product in products]


@router.get("/products/{product_id}")
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    return _product_payload(db, _product_or_404(db, product_id))


@router.post("/products", status_code=status.HTTP_201_CREATED)
def create_product(
    payload: AdminProductCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    category = _category_or_404(db, payload.category_slug)
    slug = _available_slug(db, payload.slug, payload.name)
    published_at = (
        datetime.now(timezone.utc)
        if payload.status == ProductStatus.PUBLISHED
        else None
    )

    product = Product(
        name=payload.name,
        slug=slug,
        description=payload.description,
        price_kes=payload.price_kes,
        compare_at_price_kes=payload.compare_at_price_kes,
        category_id=category.id,
        material=payload.material,
        color=payload.color,
        width_cm=payload.width_cm,
        depth_cm=payload.depth_cm,
        height_cm=payload.height_cm,
        is_hot=payload.is_hot,
        status=payload.status,
        published_at=published_at,
        stock_quantity=payload.stock,
        low_stock_threshold=payload.low_stock_threshold,
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    return _product_payload(db, product)


@router.patch("/products/{product_id}")
def update_product(
    product_id: UUID,
    payload: AdminProductUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    product = _product_or_404(db, product_id)
    values = payload.model_dump(exclude_unset=True)

    required_fields = {"name", "description", "price_kes", "category_slug", "status"}
    if any(field in values and values[field] is None for field in required_fields):
        raise HTTPException(status_code=422, detail="Required product fields cannot be null")

    if "category_slug" in values:
        category = _category_or_404(db, values.pop("category_slug"))
        product.category_id = category.id

    if "slug" in values:
        product.slug = _available_slug(
            db,
            values.pop("slug"),
            values.get("name", product.name),
            exclude_id=product.id,
        )

    old_status = product.status

    field_map = {
        "name": "name",
        "description": "description",
        "price_kes": "price_kes",
        "compare_at_price_kes": "compare_at_price_kes",
        "material": "material",
        "color": "color",
        "width_cm": "width_cm",
        "depth_cm": "depth_cm",
        "height_cm": "height_cm",
        "is_hot": "is_hot",
        "status": "status",
        "stock": "stock_quantity",
        "low_stock_threshold": "low_stock_threshold",
    }

    for field, value in values.items():
        if field in field_map:
            setattr(product, field_map[field], value)

    if (
        product.status == ProductStatus.PUBLISHED
        and old_status != ProductStatus.PUBLISHED
    ):
        product.published_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(product)
    return _product_payload(db, product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> Response:
    product = _product_or_404(db, product_id)

    # Preserve products referenced by past orders by archiving them.
    has_order = db.scalar(
        select(OrderItem.id)
        .where(OrderItem.product_id == product.id)
        .limit(1)
    )

    featured_categories = db.scalars(
        select(Category).where(Category.featured_product_id == product.id)
    ).all()
    for category in featured_categories:
        category.featured_product_id = None

    if has_order:
        product.status = ProductStatus.ARCHIVED
    else:
        db.delete(product)

    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/products/{product_id}/images",
    status_code=status.HTTP_201_CREATED,
)
def add_product_image(
    product_id: UUID,
    payload: AdminProductImageCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    product = _product_or_404(db, product_id)
    images = db.scalars(
        select(ProductImage).where(ProductImage.product_id == product.id)
    ).all()

    next_sort_order = max((image.sort_order for image in images), default=-1) + 1
    image = ProductImage(
        product_id=product.id,
        url=payload.url,
        alt=payload.alt or product.name,
        sort_order=next_sort_order,
        is_primary=not images,
    )

    db.add(image)
    db.commit()
    db.refresh(image)
    return _image_payload(image)


@router.patch("/products/{product_id}/images/{image_id}")
def update_product_image(
    product_id: UUID,
    image_id: UUID,
    payload: AdminProductImageUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> dict:
    product = _product_or_404(db, product_id)
    image = db.get(ProductImage, image_id)

    if image is None or image.product_id != product.id:
        raise HTTPException(status_code=404, detail="Image not found")

    values = payload.model_dump(exclude_unset=True)

    if "alt" in values:
        image.alt = values["alt"] or product.name

    if values.get("is_primary") is True:
        images = db.scalars(
            select(ProductImage).where(ProductImage.product_id == product.id)
        ).all()
        for product_image in images:
            product_image.is_primary = product_image.id == image.id
    elif values.get("is_primary") is False:
        image.is_primary = False

    db.commit()
    db.refresh(image)
    return _image_payload(image)


@router.delete(
    "/products/{product_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_product_image(
    product_id: UUID,
    image_id: UUID,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
) -> Response:
    product = _product_or_404(db, product_id)
    image = db.get(ProductImage, image_id)

    if image is None or image.product_id != product.id:
        raise HTTPException(status_code=404, detail="Image not found")

    was_primary = image.is_primary
    db.delete(image)
    db.flush()

    if was_primary:
        remaining = db.scalars(
            select(ProductImage)
            .where(ProductImage.product_id == product.id)
            .order_by(ProductImage.sort_order)
        ).all()
        if remaining:
            remaining[0].is_primary = True

    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)