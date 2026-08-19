from pydantic import BaseModel, Field
from typing import Optional


# -------------------------------------------------------------------
# Address
# -------------------------------------------------------------------

class Address(BaseModel):

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
# Add Address
# -------------------------------------------------------------------

class AddressCreate(Address):
    pass


# -------------------------------------------------------------------
# Update Address
# -------------------------------------------------------------------

class AddressUpdate(Address):
    pass


# -------------------------------------------------------------------
# Profile Update
# -------------------------------------------------------------------

class ProfileUpdate(BaseModel):

    phone: Optional[str] = None