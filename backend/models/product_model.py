from pydantic import BaseModel, Field
from typing import Dict, List
from datetime import datetime, timezone
from uuid import uuid4

class Product(BaseModel):

    name: str = Field(..., min_length=2, max_length=100)

    description: str

    price: float

    image_url: str

    images: List[str] = Field(
        default_factory=list
    )

    category: str

    stock: int

    # newley added
    rating: float = Field(
        default=0,
        ge=0,
        le=5
    )

    variants: Dict[str, List[str]] = Field(
        default_factory=dict
    )

    variantPrices: Dict[str, float] = Field(
        default_factory=dict
    )

    productUuid: str = Field(
        default_factory=lambda: str(uuid4())
    )

    createdAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    updatedAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )