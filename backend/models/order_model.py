from pydantic import BaseModel , Field
from typing import List, Optional 
from datetime import datetime , timezone
import uuid

class OrderItem(BaseModel) :
    productUuid : str
    name : str
    price : float
    quantity : int
    image_url : Optional[str] = None

class OrderCreate(BaseModel) :
    items : List[OrderItem]
    total_amount : float
    shipping_address : dict
    payment_method : str

class Order(BaseModel):

    orderUuid: str = Field(
        default_factory=lambda: str(uuid.uuid4())
    )

    userUuid: str
    items : List[OrderItem]
    total_amount : float
    shipping_address : dict
    payment_method : str
    status : str = "Processing"

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )