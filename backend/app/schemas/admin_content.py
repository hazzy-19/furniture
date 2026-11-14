from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class AdminCategoryCreate(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    name: str = Field(min_length=1, max_length=160)
    slug: str = Field(
        min_length=1,
        max_length=180,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    blurb: str | None = Field(default=None, max_length=2000)
    image_url: str | None = Field(default=None, max_length=2048)
    parent_slug: str | None = Field(default=None, max_length=180)
    sort_order: int = 0


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
    blurb: str | None = Field(default=None, max_length=2000)
    image_url: str | None = Field(default=None, max_length=2048)
    parent_slug: str | None = Field(default=None, max_length=180)
    sort_order: int | None = None


class AdminCategoryResponse(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
    name: str
    slug: str
    blurb: str | None = None
    image_url: str | None = None
    parent_id: str | None = None
    parent_slug: str | None = None
    parent_name: str | None = None
    sort_order: int


class AdminHeroUpdate(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    eyebrow: str | None = Field(default=None, max_length=200)
    headline_desktop: str = Field(min_length=1, max_length=300)
    headline_mobile: str = Field(min_length=1, max_length=300)
    subtext: str | None = None
    cta_label_desktop: str = Field(min_length=1, max_length=120)
    cta_label_mobile: str = Field(min_length=1, max_length=120)
    cta_path: str = Field(min_length=1, max_length=2048)
    badge: str | None = Field(default=None, max_length=100)
    image_desktop: str = Field(min_length=1, max_length=2048)
    image_mobile: str = Field(min_length=1, max_length=2048)
    is_active: bool = True


class AdminHeroResponse(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    id: str
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
    is_active: bool
