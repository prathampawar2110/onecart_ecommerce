from pydantic import BaseModel , Field
from datetime import datetime

class CartItems (BaseModel) :
    productUuid : str                                                             # Product ID : We store the product reference.
    quantity : int = Field ( ... , gt=0 )                                   # means must be integer & must be greater than zero
    selectedVariants : dict[str , str] = {}

class CartDeleteItem(BaseModel):
    selectedVariants: dict[str, str] = {}

class Cart (BaseModel) :                                                    #Represents the complete cart.
    cartUuid : str
    userUuid : str
    items : list[CartItems] = []
    updateAt : datetime
