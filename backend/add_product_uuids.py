from uuid import uuid4
from database.connection import product_collection


products = product_collection.find({
    "productUuid": {
        "$exists": False
    }
})


for product in products:

    product_collection.update_one(
        {
            "_id": product["_id"]
        },
        {
            "$set": {
                "productUuid": str(uuid4())
            }
        }
    )

    print(
        f"Added UUID to {product['name']}"
    )