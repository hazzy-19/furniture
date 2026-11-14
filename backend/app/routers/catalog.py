"""Public menu and product endpoints."""

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, aliased

from app.database import get_db
from app.models import Category, Product, ProductImage, ProductStatus
from app.schemas.content import HeroResponse, ShowroomResponse


router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/menu")
def get_menu(db: Session = Depends(get_db)) -> dict[str, Any]:
    categories = db.scalars(
        select(Category).order_by(Category.sort_order, Category.name)
    ).all()

    rooms = [category for category in categories if category.parent_id is None]
    children_by_room: dict[Any, list[Category]] = defaultdict(list)
    categories_by_id = {category.id: category for category in categories}

    for category in categories:
        if category.parent_id is not None:
            children_by_room[category.parent_id].append(category)

    featured_ids = [
        room.featured_product_id
        for room in rooms
        if room.featured_product_id is not None
    ]

    featured_products: dict[Any, Product] = {}
    if featured_ids:
        products = db.scalars(
            select(Product).where(
                Product.id.in_(featured_ids),
                Product.status == ProductStatus.PUBLISHED,
            )
        ).all()
        featured_products = {product.id: product for product in products}

    menu_rooms = []

    for room in rooms:
        room_path = f'/shop/{room.slug}'
        room_categories = children_by_room.get(room.id, [])
        featured_product = featured_products.get(room.featured_product_id)

        if featured_product:
            product_category = categories_by_id.get(featured_product.category_id)

            if product_category and product_category.parent_id == room.id:
                featured_path = f'{room_path}/{product_category.slug}'
            else:
                featured_path = room_path

            featured = {
                'label': featured_product.name,
                'path': featured_path,
                'caption': featured_product.description[:160],
            }
        else:
            featured = {
                'label': room.name,
                'path': room_path,
                'caption': '',
            }

        menu_rooms.append(
            {
                'id': room.slug,
                'label': room.name,
                'path': room_path,
                'image': room.image_url,
                'blurb': room.blurb,
                'categories': [
                    {
                        'id': f'{room.slug}-{category.slug}',
                        'label': category.name,
                        'path': f'{room_path}/{category.slug}',
                        'image': category.image_url,
                        'blurb': category.blurb,
                    }
                    for category in room_categories
                ],
                'featured': featured,
            }
        )

    return {
        'rooms': menu_rooms,
        'plainLinks': [
            {'label': 'New and hot', 'path': '/new'},
            {'label': 'Sale', 'path': '/sale', 'isHighlighted': True},
        ],
    }


def _published_product_query():
    room_category = aliased(Category)

    statement = (
        select(Product, Category, room_category)
        .join(Category, Product.category_id == Category.id)
        .outerjoin(room_category, Category.parent_id == room_category.id)
        .where(Product.status == ProductStatus.PUBLISHED)
    )

    return statement, room_category


def _product_payload(
    product: Product,
    category: Category,
    room_category: Category | None,
    image_urls: list[str],
) -> dict[str, Any]:
    room = room_category or category
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)

    if product.is_hot:
        badge = 'hot'
    elif product.published_at and product.published_at >= cutoff:
        badge = 'new'
    else:
        badge = None

    return {
        'id': str(product.id),
        'slug': product.slug,
        'name': product.name,
        'priceKes': product.price_kes,
        'compareAtPriceKes': product.compare_at_price_kes,
        'badge': badge,
        'image': image_urls[0] if image_urls else None,
        'images': image_urls,
        'stock': product.stock_quantity,
        'lowStockThreshold': product.low_stock_threshold,
        'room': room.slug,
        'category': category.slug if category.parent_id is not None else None,
        'description': product.description,
        'material': product.material,
        'color': product.color,
        'widthCm': product.width_cm,
        'depthCm': product.depth_cm,
        'heightCm': product.height_cm,
    }


def _load_products(
    db: Session,
    *,
    room: str | None = None,
    category: str | None = None,
    new_only: bool = False,
    hot_only: bool = False,
    sale_only: bool = False,
    in_stock: bool = False,
    sort: Literal['price-asc', 'price-desc'] | None = None,
    slug: str | None = None,
) -> list[dict[str, Any]]:
    statement, room_category = _published_product_query()

    if slug is not None:
        statement = statement.where(Product.slug == slug)

    if room is not None:
        statement = statement.where(
            func.coalesce(room_category.slug, Category.slug) == room
        )

    if category is not None:
        statement = statement.where(Category.slug == category)

    if new_only:
        cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        statement = statement.where(
            Product.published_at.is_not(None),
            Product.published_at >= cutoff,
        )

    if hot_only:
        statement = statement.where(Product.is_hot.is_(True))

    if sale_only:
        statement = statement.where(
            Product.compare_at_price_kes > Product.price_kes
        )

    if in_stock:
        statement = statement.where(Product.stock_quantity > 0)

    if sort == 'price-asc':
        statement = statement.order_by(Product.price_kes.asc())
    elif sort == 'price-desc':
        statement = statement.order_by(Product.price_kes.desc())
    else:
        statement = statement.order_by(
            Product.published_at.desc().nullslast(),
            Product.name.asc(),
        )

    rows = db.execute(statement).all()
    if not rows:
        return []

    product_ids = [product.id for product, _, _ in rows]
    image_rows = db.scalars(
        select(ProductImage)
        .where(ProductImage.product_id.in_(product_ids))
        .order_by(
            ProductImage.product_id,
            ProductImage.is_primary.desc(),
            ProductImage.sort_order,
        )
    ).all()

    images_by_product: dict[Any, list[str]] = defaultdict(list)

    for image in image_rows:
        images_by_product[image.product_id].append(image.url)

    return [
        _product_payload(
            product,
            category_row,
            room_row,
            images_by_product[product.id],
        )
        for product, category_row, room_row in rows
    ]


@router.get('/products')
def list_products(
    room: str | None = None,
    category: str | None = None,
    new_only: bool = False,
    hot_only: bool = False,
    sale_only: bool = False,
    in_stock: bool = False,
    sort: Literal['price-asc', 'price-desc'] | None = None,
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    return _load_products(
        db,
        room=room,
        category=category,
        new_only=new_only,
        hot_only=hot_only,
        sale_only=sale_only,
        in_stock=in_stock,
        sort=sort,
    )


@router.get('/products/{slug}')
def get_product(slug: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    products = _load_products(db, slug=slug)

    if not products:
        raise HTTPException(status_code=404, detail='Product not found')

    return products[0]