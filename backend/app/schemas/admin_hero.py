"""Pydantic schemas for admin homepage hero banner management."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class AdminHeroUpdate(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    eyebrow: str | None = Field(default=None, max_length=200)
    headline_desktop: str = Field(alias="headlineDesktop", min_length=1, max_length=300)
    headline_mobile: str = Field(alias="headlineMobile", min_length=1, max_length=300)
    subtext: str | None = None
    cta_label_desktop: str = Field(alias="ctaLabelDesktop", min_length=1, max_length=120)
    cta_label_mobile: str = Field(alias="ctaLabelMobile", min_length=1, max_length=120)
    cta_path: str = Field(alias="ctaPath", min_length=1, max_length=2048)
    badge: str | None = Field(default=None, max_length=100)
    image_desktop: str = Field(alias="imageDesktop", min_length=1, max_length=2048)
    image_mobile: str = Field(alias="imageMobile", min_length=1, max_length=2048)
    image_alt: str | None = Field(default=None, alias="imageAlt", max_length=300)
    cloudinary_public_id_desktop: str | None = Field(
        default=None, alias="cloudinaryPublicIdDesktop", max_length=255
    )
    cloudinary_public_id_mobile: str | None = Field(
        default=None, alias="cloudinaryPublicIdMobile", max_length=255
    )
    is_active: bool = Field(default=True, alias="isActive")

    @field_validator("cta_path")
    @classmethod
    def validate_cta_path(cls, v: str) -> str:
        if not v.startswith("/"):
            raise ValueError('ctaPath must start with "/"')
        return v

    @field_validator(
        "eyebrow",
        "subtext",
        "badge",
        "image_alt",
        "cloudinary_public_id_desktop",
        "cloudinary_public_id_mobile",
        mode="before",
    )
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v


class AdminHeroResponse(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    eyebrow: str | None = None
    headline_desktop: str = Field(alias="headlineDesktop")
    headline_mobile: str = Field(alias="headlineMobile")
    subtext: str | None = None
    cta_label_desktop: str = Field(alias="ctaLabelDesktop")
    cta_label_mobile: str = Field(alias="ctaLabelMobile")
    cta_path: str = Field(alias="ctaPath")
    badge: str | None = None
    image_desktop: str = Field(alias="imageDesktop")
    image_mobile: str = Field(alias="imageMobile")
    image_alt: str | None = Field(default=None, alias="imageAlt")
    cloudinary_public_id_desktop: str | None = Field(
        default=None, alias="cloudinaryPublicIdDesktop"
    )
    cloudinary_public_id_mobile: str | None = Field(
        default=None, alias="cloudinaryPublicIdMobile"
    )
    is_active: bool = Field(alias="isActive")
