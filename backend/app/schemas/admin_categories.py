"""Pydantic schemas for admin category management."""

from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class AdminCategoryCreate(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    name: str = Field(min_length=1, max_length=160)
    slug: str | None = Field(
        default=None,
        max_length=180,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    parent_id: UUID | None = Field(default=None, alias="parentId")
    parent_slug: str | None = Field(default=None, alias="parentSlug", max_length=180)
    sort_order: int = Field(default=0, alias="sortOrder")
    image_url: str | None = Field(default=None, alias="imageUrl", max_length=2048)
    cloudinary_public_id: str | None = Field(
        default=None, alias="cloudinaryPublicId", max_length=255
    )
    blurb: str | None = Field(default=None, max_length=2000)
    featured_product_id: UUID | None = Field(default=None, alias="featuredProductId")

    @field_validator(
        "slug",
        "parent_slug",
        "image_url",
        "cloudinary_public_id",
        "blurb",
        mode="before",
    )
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v


class AdminCategoryUpdate(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    name: str | None = Field(default=None, min_length=1, max_length=160)
    slug: str | None = Field(
        default=None,
        min_length=1,
        max_length=180,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    parent_id: UUID | None = Field(default=None, alias="parentId")
    parent_slug: str | None = Field(default=None, alias="parentSlug", max_length=180)
    sort_order: int | None = Field(default=None, alias="sortOrder")
    image_url: str | None = Field(default=None, alias="imageUrl", max_length=2048)
    cloudinary_public_id: str | None = Field(
        default=None, alias="cloudinaryPublicId", max_length=255
    )
    blurb: str | None = Field(default=None, max_length=2000)
    featured_product_id: UUID | None = Field(default=None, alias="featuredProductId")

    @field_validator(
        "name",
        "slug",
        "parent_slug",
        "image_url",
        "cloudinary_public_id",
        "blurb",
        mode="before",
    )
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v


class AdminCategoryResponse(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    name: str
    slug: str
    parent_id: str | None = Field(default=None, alias="parentId")
    sort_order: int = Field(alias="sortOrder")
    image_url: str | None = Field(default=None, alias="imageUrl")
    cloudinary_public_id: str | None = Field(
        default=None, alias="cloudinaryPublicId"
    )
    blurb: str | None = None
    featured_product_id: str | None = Field(
        default=None, alias="featuredProductId"
    )
