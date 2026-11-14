from typing import Any
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class HeroResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    eyebrow: str | None = None
    headline_desktop: str
    headline_mobile: str
    subtext: str | None = None
    cta_label_desktop: str
    cta_label_mobile: str
    cta_path: str
    badge: str | None = None
    image_desktop: str
    image_mobile: str
    image_alt: str | None = None


class ShowroomHour(BaseModel):
    days: str
    time: str


class ShowroomResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: str
    city: str
    area: str
    hours: list[ShowroomHour]
    phone: str
    whatsapp_number: str
    name: str | None = None
    address: str | None = None
    map_url: str | None = None
    sort_order: int | None = None

