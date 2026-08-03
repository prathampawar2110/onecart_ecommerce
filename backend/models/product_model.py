from pydantic import BaseModel, Field

class Product(BaseModel):                           #Every product sent from the frontend must follow this structure.
    name : str = Field( ... , min_length=2 , max_length=100)                 # '...' means that this field is required 
    description : str
    price : float
    image_url : str
    category : str
    stock : int
    