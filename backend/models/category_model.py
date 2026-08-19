from pydantic import BaseModel, Field
from datetime import datetime,timezone


class Category(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=50
    )

    createdAt: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )