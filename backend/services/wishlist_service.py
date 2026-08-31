from fastapi import HTTPException

from models.wishlist_model import WishlistItem
from database.connection import (wishlist_collection , product_collection)
from datetime import datetime,timezone
import uuid

from utils.logger import logger

#======================================================================

# Add to Wishlist

def add_to_wishlist(
        item : WishlistItem,
        user : dict
):

    user_uuid = user["userUuid"] 

    # Check Product exists
    product = product_collection.find_one(
        {
            "productUuid" : item.productUuid
        }
    )

    if ( product is None ) : 
        logger.warning(
            "wishlist_product_not_found",
            product_uuid = item.productUuid,
            user_uuid = user_uuid
        )

        raise HTTPException(
            status_code=404,
            detail="Product Not Found"
        )

    # FInd User's wishlist
    wishlist = wishlist_collection.find_one(
        {
            "userUuid" : user_uuid
        }
    )

    # Wishlist already exist
    if (wishlist) :

        # Check Duplicate Product
        existing_product = next(
            (
                wishlist_item
                for wishlist_item in wishlist["products"]
                if wishlist_item["productUuid"] == item.productUuid
            ),
            None
        )

        if (existing_product) :
            logger.info(
                "wishlist_product_already_exists",
                user_uuid = user_uuid,
                product_uuid = item.productUuid
            )
            return{
                "message" : "Product already in wishlist"
            }

        # Add product
        wishlist_collection.update_one(
            {
                "userUuid" : user_uuid
            },
            {
                "$push" : {
                    "products" : {
                        "productUuid" : item.productUuid,
                        "addAt" : datetime.now(timezone.utc)
                    }
                }
            }
        )

    # Create new wishlist
    else :
        wishlist_uuid = str(uuid.uuid4())

        wishlist_collection.insert_one(
            {
                "wishlistUuid" : wishlist_uuid,
                "userUuid" : user_uuid,
                "product" : [
                    {
                        "productUuid" : item.productUuid,
                        "addAt" : datetime.now(timezone.utc)
                    }
                ]
            }
        )

    logger.info(
        "wishlist_product_added",
        user_uuid = user_uuid,
        product_uuid = item.productUuid
    )

    return{
        "message" : "Product Added to wishlist"
    }

# ============================================================
# GET WISHLIST
# ============================================================

def get_wishlist(user: dict):

    user_uuid = user["userUuid"]

    wishlist = wishlist_collection.find_one(
        {
            "userUuid": user_uuid
        }
    )

    # --------------------------------------------------------
    # Wishlist does not exist
    # --------------------------------------------------------

    if wishlist is None:

        logger.info(
            "wishlist_empty",
            user_uuid=user_uuid
        )

        return {
            "message": "Wishlist is Empty",
            "products": []
        }

    products = []

    # --------------------------------------------------------
    # Get products from wishlist
    # --------------------------------------------------------

    for wishlist_item in wishlist["products"]:

        product_uuid = wishlist_item["productUuid"]

        product = product_collection.find_one(
            {
                "productUuid": product_uuid
            }
        )

        # Product may have been deleted
        if product:

            product.pop("_id", None)

            # Add wishlist date
            product["addAt"] = wishlist_item["addAt"]

            products.append(product)

    logger.info(
        "wishlist_fetched",
        user_uuid=user_uuid,
        product_count=len(products)
    )

    return {
        "wishlistUuid": wishlist["wishlistUuid"],
        "userUuid": wishlist["userUuid"],
        "products": products
    }


# ============================================================
# REMOVE FROM WISHLIST
# ============================================================

def remove_from_wishlist(
    productUuid: str,
    user: dict
):

    user_uuid = user["userUuid"]

    wishlist = wishlist_collection.find_one(
        {
            "userUuid": user_uuid
        }
    )

    if wishlist is None:

        logger.warning(
            "wishlist_not_found",
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=404,
            detail="Wishlist not found"
        )

    result = wishlist_collection.update_one(
        {
            "userUuid": user_uuid
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

        logger.warning(
            "wishlist_product_not_found",
            user_uuid=user_uuid,
            product_uuid=productUuid
        )

        raise HTTPException(
            status_code=404,
            detail="Product not found in wishlist"
        )

    logger.info(
        "wishlist_product_removed",
        user_uuid=user_uuid,
        product_uuid=productUuid
    )

    return {
        "message": "Product removed from wishlist"
    }    