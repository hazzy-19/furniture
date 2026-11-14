"""Pydantic schemas for admin authentication."""

from pydantic import BaseModel, ConfigDict, EmailStr
from pydantic.alias_generators import to_camel


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminMeResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: str | None = None
    email: str
    role: str

