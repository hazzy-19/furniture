from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ProductStatus


class AdminProductCreate(BaseModel):
    model_config = ConfigDict(
        alias_generator=lambda name: "".join(
            part.capitalize() if index else part
            for index, part in enumerate(name.split("_"))
        ),
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    name: str = Field(min_length=1, max_length=200)
    slug: str | None = Field(default=None, max_length=220)
    description: str = Field(min_length=1)
    price_kes: int = Field(alias="priceKes", ge=0)
    compare_at_price_kes: int | None = Field(
        default=None,
        alias="compareAtPriceKes",
        ge=0,
    )
    category_slug: str = Field(alias="categorySlug", min_length=1, max_length=180)
    material: str | None = Field(default=None, max_length=120)
    color: str | None = Field(default=None, max_length=100)
    width_cm: int | None = Field(default=None, ge=0)
    depth_cm: int | None = Field(default=None, ge=0)
    height_cm: int | None = Field(default=None, ge=0)
    is_hot: bool = Field(default=False, alias="isHot")
    status: ProductStatus = ProductStatus.DRAFT
    stock: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=3, alias="lowStockThreshold", ge=0)


class AdminProductUpdate(BaseModel):
    model_config = ConfigDict(
        alias_generator=lambda name: "".join(
            part.capitalize() if index else part
            for index, part in enumerate(name.split("_"))
        ),
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    name: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = Field(default=None, max_length=220)
    description: str | None = Field(default=None, min_length=1)
    price_kes: int | None = Field(default=None, alias="priceKes", ge=0)
    compare_at_price_kes: int | None = Field(
        default=None,
        alias="compareAtPriceKes",
        ge=0,
    )
    category_slug: str | None = Field(
        default=None,
        alias="categorySlug",
        min_length=1,
        max_length=180,
    )
    material: str | None = Field(default=None, max_length=120)
    color: str | None = Field(default=None, max_length=100)
    width_cm: int | None = Field(default=None, ge=0)
    depth_cm: int | None = Field(default=None, ge=0)
    height_cm: int | None = Field(default=None, ge=0)
    is_hot: bool | None = Field(default=None, alias="isHot")
    status: ProductStatus | None = None
    stock: int | None = Field(default=None, ge=0)
    low_stock_threshold: int | None = Field(
        default=None,
        alias="lowStockThreshold",
        ge=0,
    )


class AdminProductImageCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    url: str = Field(min_length=1, max_length=2048)
    alt: str | None = Field(default=None, max_length=255)


class AdminProductImageUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    alt: str | None = Field(default=None, max_length=255)
    is_primary: bool | None = Field(default=None, alias="isPrimary")