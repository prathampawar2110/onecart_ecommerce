from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List 
from datetime import datetime , timezone
import uuid


# -------------------------------------------------------------------
# Saved Address
# -------------------------------------------------------------------

class Address(BaseModel):

    addressUuid: str = Field(
        default_factory=lambda: str(uuid.uuid4())
    )

    label: str = Field(
        default="Home",
        min_length=1,
        max_length=30
    )

    street: str
    city: str
    state: str
    pincode: str


# -------------------------------------------------------------------
# New User / Registration
# -------------------------------------------------------------------

class User(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=50
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=6,
        # max_length=72
    )

    phone: Optional[str] = None

    addresses: List[Address] = Field(
        default_factory=list
    )

    # UUID for API usage
    userUuid: str = Field(
        default_factory=lambda: str(uuid.uuid4())
    )

    # for displaying created time
    created_at: datetime = Field(
            default_factory=lambda: datetime.now(timezone.utc)
    )


# -------------------------------------------------------------------
# Login
# -------------------------------------------------------------------

class UserLogin(BaseModel):

    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod

    def validate_password(cls, value):
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password cannot be longer than 72 bytes")
        return value

 