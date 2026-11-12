"""Python enums and their PostgreSQL enum column types."""

from enum import Enum as PythonEnum

from sqlalchemy import Enum as SQLAlchemyEnum


class ProductStatus(str, PythonEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class NotificationType(str, PythonEnum):
    NEW_ARRIVAL = "new_arrival"
    HOT_ITEM = "hot_item"
    LOW_STOCK = "low_stock"


class NotificationStatus(str, PythonEnum):
    QUEUED = "queued"
    SENT = "sent"
    FAILED = "failed"


class AdminRole(str, PythonEnum):
    ADMIN = "admin"
    EDITOR = "editor"


class OrderStatus(str, PythonEnum):
    INITIATED = "initiated"
    CONFIRMED = "confirmed"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


def enum_column_type(enum_class: type[PythonEnum], name: str) -> SQLAlchemyEnum:
    """Store lowercase enum values in a named native PostgreSQL enum."""
    return SQLAlchemyEnum(
        enum_class,
        name=name,
        native_enum=True,
        values_callable=lambda members: [member.value for member in members],
    )
