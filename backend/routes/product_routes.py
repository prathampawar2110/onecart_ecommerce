from fastapi import APIRouter, Depends

from models.product_model import Product
from database.connection import product_collection

from datetime import datetime, timezone

from utils.auth import get_current_admin


router = APIRouter()


# ============================================================
# CREATE PRODUCT
# ============================================================

@router.post("/products")
def create_product(
    product: Product,
    admin: dict = Depends(get_current_admin)
):

    now = datetime.now(timezone.utc)

    product_dict = product.model_dump()

    # Use the same names as Product model
    product_dict["created_at"] = now
    product_dict["updated_at"] = now

    product_collection.insert_one(product_dict)

    return {
        "message": "Product created successfully",
        "productUuid": product_dict["productUuid"]
    }


# ============================================================
# GET ALL PRODUCTS
# ============================================================

@router.get("/products")
def get_product():

    products = list(product_collection.find())

    for product in products:
        product.pop("_id", None)

    return products


# ============================================================
# SEARCH PRODUCTS
# ============================================================

@router.get("/products/search")
def search_products(query: str):

    if not query.strip():
        return []

    products = list(
        product_collection.find(
            {
                "$or": [
                    {
                        "name": {
                            "$regex": query,
                            "$options": "i"
                        }
                    }
                ]
            }
        )
    )

    for product in products:
        product.pop("_id", None)

    return products


# ============================================================
# PRODUCTS BY CATEGORY
# ============================================================

@router.get("/products/category/{category}")
def get_product_by_category(category: str):

    products = list(
        product_collection.find(
            {
                "category": {
                    "$regex": f"^{category}$",
                    "$options": "i"
                }
            }
        )
    )

    for product in products:
        product.pop("_id", None)

    return products


# ============================================================
# GET SINGLE PRODUCT
# ============================================================

@router.get("/products/{product_uuid}")
def get_product_by_id(product_uuid: str):

    print("UUID RECEIVED:", product_uuid)

    # IMPORTANT:
    # Database field is productUuid
    product = product_collection.find_one(
        {
            "productUuid": product_uuid
        }
    )

    print("PRODUCT FOUND:", product)

    if product:

        product.pop("_id", None)

        return product

    return {
        "message": "Product not found"
    }


# ============================================================
# UPDATE PRODUCT
# ============================================================

@router.put("/products/{product_uuid}")
def update_product(
    product_uuid: str,
    product: Product,
    admin: dict = Depends(get_current_admin)
):

    product_data = product.model_dump(
        exclude={
            "productUuid",
            "created_at",
            "updated_at"
        }
    )

    product_data["updated_at"] = datetime.now(timezone.utc)

    result = product_collection.update_one(
        {
            "productUuid": product_uuid
        },
        {
            "$set": product_data
        }
    )

    if result.matched_count == 0:
        return {
            "message": "Product Not Found"
        }

    return {
        "message": "Product Updated Successfully"
    }


# ============================================================
# DELETE PRODUCT
# ============================================================

@router.delete("/products/{product_uuid}")
def delete_product(
    product_uuid: str,
    admin: dict = Depends(get_current_admin)
):

    result = product_collection.delete_one(
        {
            "productUuid": product_uuid
        }
    )

    if result.deleted_count == 1:

        return {
            "message": "Product Deleted Successfully"
        }

    return {
        "message": "Product Not Found"
    }