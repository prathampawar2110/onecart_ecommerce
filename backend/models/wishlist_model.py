from pydantic import BaseModel
from datetime import datetime

class WishlistItem(BaseModel) :
    productUuid : str
    addAt : datetime | None = None

