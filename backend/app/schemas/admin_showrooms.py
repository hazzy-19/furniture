"""Pydantic schemas for admin showrooms management."""

import re
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class ShowroomHourSchema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    days: str = Field(min_length=1, max_length=100)
    time: str = Field(min_length=1, max_length=100)


class AdminShowroomCreate(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    city: str = Field(min_length=1, max_length=120)
    area: str = Field(min_length=1, max_length=200)
    name: str | None = Field(default=None, max_length=160)
    address: str | None = Field(default=None, max_length=500)
    phone: str = Field(min_length=1, max_length=50)
    whatsapp_number: str = Field(alias="whatsappNumber")
    map_url: str | None = Field(default=None, alias="mapUrl", max_length=2048)
    sort_order: int = Field(default=0, alias="sortOrder")
    hours: list[ShowroomHourSchema] = Field(min_length=1)

    @field_validator("whatsapp_number", mode="before")
    @classmethod
    def validate_whatsapp(cls, v: Any) -> str:
        if not isinstance(v, str):
            raise ValueError("whatsappNumber must be a string")
        cleaned = re.sub(r"[\s\-]+", "", v)
        if not re.fullmatch(r"\d{10,15}", cleaned):
            raise ValueError(
                "whatsappNumber must be digits only, 10 to 15 characters, no plus sign"
            )
        return cleaned

    @field_validator("name", "address", "map_url", mode="before")
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v


class AdminShowroomUpdate(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    city: str | None = Field(default=None, min_length=1, max_length=120)
    area: str | None = Field(default=None, min_length=1, max_length=200)
    name: str | None = Field(default=None, max_length=160)
    address: str | None = Field(default=None, max_length=500)
    phone: str | None = Field(default=None, min_length=1, max_length=50)
    whatsapp_number: str | None = Field(default=None, alias="whatsappNumber")
    map_url: str | None = Field(default=None, alias="mapUrl", max_length=2048)
    sort_order: int | None = Field(default=None, alias="sortOrder")
    hours: list[ShowroomHourSchema] | None = Field(default=None, min_length=1)

    @field_validator("whatsapp_number", mode="before")
    @classmethod
    def validate_whatsapp(cls, v: Any) -> str | None:
        if v is None:
            return None
        if not isinstance(v, str):
            raise ValueError("whatsappNumber must be a string")
        cleaned = re.sub(r"[\s\-]+", "", v)
        if not re.fullmatch(r"\d{10,15}", cleaned):
            raise ValueError(
                "whatsappNumber must be digits only, 10 to 15 characters, no plus sign"
            )
        return cleaned

    @field_validator("name", "address", "map_url", mode="before")
    @classmethod
    def empty_string_to_none(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.strip():
            return None
        return v


class AdminShowroomResponse(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    city: str
    area: str
    name: str
    address: str
    phone: str
    whatsapp_number: str = Field(alias="whatsappNumber")
    map_url: str | None = Field(default=None, alias="mapUrl")
    sort_order: int = Field(alias="sortOrder")
    hours: list[ShowroomHourSchema]
