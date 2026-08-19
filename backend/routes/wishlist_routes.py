from fastapi import APIRouter, Depends, HTTPException
# from bson import ObjectId

from models.wishlist_model import WishlistItem
from database.connection import wishlist_collection, product_collection
from utils.auth import get_current_user

import uuid
from datetime import datetime, timezone


router = APIRouter()


# ----------------------------------------------------------------------------------------------------------------------------------------------------------------
# Add to Wishlist
# ----------------------------------------------------------------------------------------------------------------------------------------------------------------

@router.post("/wishlist")
def add_to_wishlist(
    item: WishlistItem,
    user: dict = Depends(get_current_user)
):

    # Check product exists
    product = product_collection.find_one(
        {
            "productUuid": item.productUuid
        }
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product Not Found"
        )

    # Get logged-in user's UUID
    userUuid = user["userUuid"]

    wishlist = wishlist_collection.find_one(
        {
            "userUuid": userUuid
        }
    )

    # Wishlist exists
    if wishlist:

        # Check duplicate product
        existing_product = next(
            (
                wishlist_item
                for wishlist_item in wishlist["products"]
                if wishlist_item["productUuid"] == item.productUuid
            ),
            None
        )

        if existing_product:
            return {
                "message": "Product already in wishlist"
            }

        # Add product with addAt
        wishlist_collection.update_one(
            {
                "userUuid": userUuid
            },
            {
                "$push": {
                    "products": {
                        "productUuid": item.productUuid,
                        "addAt": datetime.now(timezone.utc)
                    }
                }
            }
        )

    # Create new wishlist
    else:

        wishlistUuid = str(uuid.uuid4())

        wishlist_collection.insert_one(
            {
                "wishlistUuid": wishlistUuid,
                "userUuid": userUuid,
                "products": [
                    {
                        "productUuid": item.productUuid,
                        "addAt": datetime.now(timezone.utc)
                    }
                ]
            }
        )

    return {
        "message": "Product Added to Wishlist"
    }


# ----------------------------------------------------------------------------------------------------------------------------------------------------------------
# Get Wishlist
# ----------------------------------------------------------------------------------------------------------------------------------------------------------------

@router.get("/wishlist")
def get_wishlist(
    user: dict = Depends(get_current_user)
):

    # Get logged-in user's UUID
    userUuid = user["userUuid"]

    wishlist = wishlist_collection.find_one(
        {
            "userUuid": userUuid
        }
    )

    if wishlist is None:
        return {
            "message": "Wishlist is Empty",
            "products": []
        }

    products = []

    for wishlist_item in wishlist["products"]:

        productUuid = wishlist_item["productUuid"]

        # Find product
        product = product_collection.find_one(
            {
                "productUuid": productUuid
            }
        )

        if product:

            product.pop("_id", None)

            # Add wishlist date to product response
            product["addAt"] = wishlist_item["addAt"]

            products.append(product)

    return {
        "wishlistUuid": wishlist["wishlistUuid"],
        "userUuid": wishlist["userUuid"],
        "products": products
    }


# ----------------------------------------------------------------------------------------------------------------------------------------------------------------
# Remove From Wishlist
# ----------------------------------------------------------------------------------------------------------------------------------------------------------------

@router.delete("/wishlist/{productUuid}")
def remove_from_wishlist(
    productUuid: str,
    user: dict = Depends(get_current_user)
):

    userUuid = user["userUuid"]

    wishlist = wishlist_collection.find_one(
        {
            "userUuid": userUuid
        }
    )

    if wishlist is None:
        raise HTTPException(
            status_code=404,
            detail="Wishlist not found"
        )

    result = wishlist_collection.update_one(
        {
            "userUuid": userUuid
        },
        {
            "$pull": {
                "products": {
                    "productUuid": productUuid
                }
            }
        }
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Product not found in wishlist"
        )

    return {
        "message": "Product removed from wishlist"
    }