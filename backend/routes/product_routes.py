#Instead of putting every API inside main.py, we divide them into separate files.
from fastapi import APIRouter                   

#Whenever a user sends JSON, FastAPI checks whether it matches the Product model.
from models.product_model import Product

#Now this route can access the products collection in MongoDB.
from database.connection import product_collection

#to handle unique ID numbers in MongoDB and convert these special ID values in Python.
from bson import ObjectId
#---------------------------------------------------------------------------------------------------------

#Think of router as a mini FastAPI application that handles only product-related APIs. 
# Later, main.py will include this router.
router = APIRouter()

#---------------------------------------------------------------------------------------------------------
# To create a new product in the database
@router.post("/products")                                            #This creates the endpoint:
def create_product( product : Product):                        #FastAPI receives JSON and converts it into a Product object.

    #Pydantic models aren't inserted directly into MongoDB; model_dump() converts them into a normal Python dictionary.
    product_dict = product.model_dump()                    

    # MongoDB stores the document and automatically generates an _id.
    result = product_collection.insert_one(product_dict)    

    return {
        "message" : "Product created successfully",
        "product_id" : str(result.inserted_id)
    }
#---------------------------------------------------------------------------------------------------------
# to get all products from database
@router.get("/products")
def get_product():
    products = list(product_collection.find())

    for pro in products:
        pro["_id"] = str(pro["_id"])
    return products
#---------------------------------------------------------------------------------------------------------
# To get a single product by its ID
@router.get("/products/{product_id}")
def get_product_by_id(product_id : str) :
    product = product_collection.find_one(
        { "_id" : ObjectId(product_id) }
    )

    if product :
        product["_id"] = str( product["_id"] )
        return product

    return {
        "message" : "Product not found"
    }
#---------------------------------------------------------------------------------------------------------
# To update a product by its ID
@router.put("/products/{product_id}")
def update_product(product_id: str, product: Product):

    result = product_collection.update_one(
        {"_id": ObjectId(product_id)},
        {
            "$set": product.model_dump()
        }
    )

    if result.modified_count == 1:
        return {
            "message": "Product Updated Successfully"
        }

    return {
        "message": "Product Not Found or No Changes Made"
    }
#---------------------------------------------------------------------------------------------------------
# To delete a product by its ID
@router.delete("/products/{product_id}")
def delete_product(product_id: str):

    result = product_collection.delete_one(
        {"_id": ObjectId(product_id)}
    )

    if result.deleted_count == 1:
        return {
            "message": "Product Deleted Successfully"
        }

    return {
        "message": "Product Not Found"
    }