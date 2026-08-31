from fastapi import HTTPException
from database.connection import cart_collection, product_collection
from models.cart_model import CartItems, CartDeleteItem
from datetime import datetime, timezone
import uuid

from utils.logger import logger


# ============================================================
# ADD TO CART
# ============================================================

def add_to_cart(item: CartItems, user: dict):

    user_uuid = user["userUuid"]

    # --------------------------------------------------------
    # Check product exists
    # --------------------------------------------------------

    product = product_collection.find_one(
        {
            "productUuid": item.productUuid
        }
    )

    if product is None:
        logger.warning(
            "cart_product_not_found",
            product_uuid=item.productUuid,
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=404,
            detail="Product Not Found"
        )

    # --------------------------------------------------------
    # Find user's cart
    # --------------------------------------------------------

    cart = cart_collection.find_one(
        {
            "userUuid": user_uuid
        }
    )

    # --------------------------------------------------------
    # Cart already exists
    # --------------------------------------------------------

    if cart:

        existing_item = next(
            (
                cart_item
                for cart_item in cart["items"]
                if (
                    cart_item["productUuid"] == item.productUuid
                    and
                    cart_item.get("selectedVariants", {})
                    == item.selectedVariants
                )
            ),
            None
        )

        # ----------------------------------------------------
        # Product already exists in cart
        # ----------------------------------------------------

        if existing_item:

            new_quantity = (
                existing_item["quantity"] + item.quantity
            )

            cart_collection.update_one(
                {
                    "userUuid": user_uuid,
                    "items": {
                        "$elemMatch": {
                            "productUuid": item.productUuid,
                            "selectedVariants": item.selectedVariants
                        }
                    }
                },
                {
                    "$set": {
                        "items.$.quantity": new_quantity,
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            logger.info(
                "cart_item_quantity_increased",
                user_uuid=user_uuid,
                product_uuid=item.productUuid,
                quantity=new_quantity
            )

        # ----------------------------------------------------
        # Product does not exist in cart
        # ----------------------------------------------------

        else:

            cart_collection.update_one(
                {
                    "userUuid": user_uuid
                },
                {
                    "$push": {
                        "items": item.model_dump()
                    },
                    "$set": {
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            logger.info(
                "cart_item_added",
                user_uuid=user_uuid,
                product_uuid=item.productUuid,
                quantity=item.quantity
            )

    # --------------------------------------------------------
    # Cart does not exist
    # --------------------------------------------------------

    else:

        cart_collection.insert_one(
            {
                "cartUuid": str(uuid.uuid4()),
                "userUuid": user_uuid,
                "items": [
                    item.model_dump()
                ],
                "updatedAt": datetime.now(timezone.utc)
            }
        )

        logger.info(
            "cart_created",
            user_uuid=user_uuid,
            product_uuid=item.productUuid,
            quantity=item.quantity
        )

    return {
        "message": "Product Added Successfully in Cart",
        "user": user,
        "product": item
    }


# ============================================================
# GET CART
# ============================================================

def get_cart(user: dict):

    user_uuid = user["userUuid"]

    cart = cart_collection.find_one(
        {
            "userUuid": user_uuid
        }
    )

    # --------------------------------------------------------
    # Cart does not exist
    # --------------------------------------------------------

    if cart is None:

        logger.info(
            "cart_empty",
            user_uuid=user_uuid
        )

        return {
            "message": "Cart is Empty",
            "items": []
        }

    cart_items = []

    # --------------------------------------------------------
    # Build cart response
    # --------------------------------------------------------

    for item in cart["items"]:

        product = product_collection.find_one(
            {
                "productUuid": item["productUuid"]
            }
        )

        # Product may have been deleted
        if product is None:
            continue

        selected_variants = item.get(
            "selectedVariants",
            {}
        )

        # ----------------------------------------------------
        # Normal product price
        # ----------------------------------------------------

        item_price = product["price"]

        # ----------------------------------------------------
        # Variant price
        # ----------------------------------------------------

        variant_prices = product.get(
            "variantPrices",
            {}
        )

        if selected_variants and variant_prices:

            price_key = "|".join(
                f"{name}={selected_variants[name]}"
                for name in product.get("variants", {}).keys()
                if name in selected_variants
            )

            item_price = variant_prices.get(
                price_key,
                product["price"]
            )

        # ----------------------------------------------------
        # Add item to response
        # ----------------------------------------------------

        cart_items.append(
            {
                "productUuid": item["productUuid"],
                "name": product["name"],
                "price": item_price,
                "image_url": product["image_url"],
                "quantity": item["quantity"],
                "selectedVariants": selected_variants
            }
        )

    logger.info(
        "cart_fetched",
        user_uuid=user_uuid,
        item_count=len(cart_items)
    )

    return {
        "cartUuid": cart["cartUuid"],
        "userUuid": cart["userUuid"],
        "items": cart_items,
        "updateAt": datetime.now(timezone.utc)
    }


# ============================================================
# UPDATE CART QUANTITY
# ============================================================

def update_cart_quantity(
    productUuid: str,
    item: CartItems,
    user: dict
):

    user_uuid = user["userUuid"]

    cart = cart_collection.find_one(
        {
            "userUuid": user_uuid
        }
    )

    if cart is None:

        logger.warning(
            "cart_not_found",
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=404,
            detail="Cart not Found"
        )

    result = cart_collection.update_one(
        {
            "userUuid": user_uuid,
            "items": {
                "$elemMatch": {
                    "productUuid": productUuid,
                    "selectedVariants": item.selectedVariants
                }
            }
        },
        {
            "$set": {
                "items.$.quantity": item.quantity,
                "updatedAt": datetime.now(timezone.utc)
            }
        }
    )

    if result.modified_count == 0:

        logger.warning(
            "cart_item_not_found",
            user_uuid=user_uuid,
            product_uuid=productUuid
        )

        raise HTTPException(
            status_code=404,
            detail="Product not Found in Cart"
        )

    logger.info(
        "cart_quantity_updated",
        user_uuid=user_uuid,
        product_uuid=productUuid,
        quantity=item.quantity
    )

    return {
        "message": "Cart Quantity Updated Successfully"
    }


# ============================================================
# REMOVE FROM CART
# ============================================================

def remove_from_cart(
    productUuid: str,
    item: CartDeleteItem,
    user: dict
):

    user_uuid = user["userUuid"]

    cart = cart_collection.find_one(
        {
            "userUuid": user_uuid
        }
    )

    if cart is None:

        logger.warning(
            "cart_not_found",
            user_uuid=user_uuid
        )

        raise HTTPException(
            status_code=404,
            detail="Cart not found"
        )

    result = cart_collection.update_one(
        {
            "userUuid": user_uuid
        },
        {
            "$pull": {
                "items": {
                    "productUuid": productUuid,
                    "selectedVariants": item.selectedVariants
                }
            },
            "$set": {
                "updatedAt": datetime.now(timezone.utc)
            }
        }
    )

    if result.modified_count == 0:

        logger.warning(
            "cart_item_not_found",
            user_uuid=user_uuid,
            product_uuid=productUuid
        )

        raise HTTPException(
            status_code=404,
            detail="Product not found in cart"
        )

    logger.info(
        "cart_item_removed",
        user_uuid=user_uuid,
        product_uuid=productUuid
    )

    return {
        "message": "Product removed from cart"
    }