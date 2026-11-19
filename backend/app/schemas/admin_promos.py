"""Pydantic schemas for admin promo messages management."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class AdminPromoCreate(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    text: str = Field(min_length=1, max_length=160)
    sort_order: int = Field(default=0, alias="sortOrder")
    is_active: bool = Field(default=True, alias="isActive")


class AdminPromoUpdate(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    text: str | None = Field(default=None, min_length=1, max_length=160)
    sort_order: int | None = Field(default=None, alias="sortOrder")
    is_active: bool | None = Field(default=None, alias="isActive")

    @field_validator("text", mode="before")
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v


class AdminPromoResponse(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    text: str
    sort_order: int = Field(alias="sortOrder")
    is_active: bool = Field(alias="isActive")
