"""Import all models here so SQLAlchemy and Alembic can discover them."""

from app.models.admin import AdminUser
from app.models.catalog import Category, Product, ProductImage
from app.models.content import HeroBanner, PromoMessage, Showroom
from app.models.enums import (
    AdminRole,
    NotificationStatus,
    NotificationType,
    OrderStatus,
    ProductStatus,
)
from app.models.orders import Order, OrderItem
from app.models.subscribers import Favorite, NotificationLog, Subscriber

__all__ = [
    "AdminRole",
    "AdminUser",
    "Category",
    "Favorite",
    "HeroBanner",
    "NotificationLog",
    "NotificationStatus",
    "NotificationType",
    "Order",
    "OrderItem",
    "OrderStatus",
    "Product",
    "ProductImage",
    "ProductStatus",
    "PromoMessage",
    "Showroom",
    "Subscriber",
]
