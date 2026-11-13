from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SubscriberCreate(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        str_strip_whitespace=True,
    )

    email: EmailStr
    wants_new_arrivals: bool = Field(
        default=True,
        validation_alias="wantsNewArrivals",
    )
    wants_hot_items: bool = Field(
        default=True,
        validation_alias="wantsHotItems",
    )
    wants_low_stock: bool = Field(
        default=True,
        validation_alias="wantsLowStock",
    )
    source: str = Field(
        default="website",
        min_length=1,
        max_length=255,
    )


class SubscriberResponse(BaseModel):
    ok: bool
    message: str