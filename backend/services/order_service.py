from fastapi import HTTPException
from datetime import datetime, timezone
import uuid

from database.connection import (
    order_collection,
    product_collection,
    user_collection
)


# ============================================================
# CREATE ORDER
# ============================================================

def create_order_service(order_data, user):
    """
    Business logic for creating an order.

    Route should only handle:
    - Request
    - Authentication
    - Calling this service
    - Returning response
    """

    # --------------------------------------------------------
    # NEW: Check cart/order items
    # WHY:
    # An order cannot be created without products.
    # --------------------------------------------------------

    if not order_data.items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    total_amount = 0

    # --------------------------------------------------------
    # NEW: Validate every product from MongoDB
    # WHY:
    # Never trust product name/price/stock sent by frontend.
    # MongoDB is the source of truth.
    # --------------------------------------------------------

    for item in order_data.items:

        product = product_collection.find_one(
            {
                "productUuid": item.productUuid
            }
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product not found: {item.productUuid}"
            )

        # ----------------------------------------------------
        # NEW: Check stock
        # WHY:
        # Prevent customer from ordering more than available.
        # ----------------------------------------------------

        if product["stock"] < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Not enough stock for {product['name']}. "
                    f"Available stock: {product['stock']}"
                )
            )

        # ----------------------------------------------------
        # NEW: Get actual price from database
        # WHY:
        # Frontend price can be modified by the client.
        # Backend must determine the real price.
        # ----------------------------------------------------

        item_price = product["price"]

        # ----------------------------------------------------
        # NEW: Support product variants
        # WHY:
        # Your products can have different prices for
        # different combinations such as:
        #
        # Ram=8GB|Storage=256GB
        # ----------------------------------------------------

        selected_variants = getattr(
            item,
            "selectedVariants",
            {}
        )

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
        # NEW: Calculate total on backend
        # WHY:
        # Never trust order_data.total_amount from frontend.
        # ----------------------------------------------------

        total_amount += item_price * item.quantity

    # --------------------------------------------------------
    # NEW: Generate Order UUID
    # --------------------------------------------------------

    order_uuid = str(uuid.uuid4())

    # --------------------------------------------------------
    # NEW: Build order items using database prices
    # WHY:
    # Store the price actually used when the order was placed.
    #
    # Example:
    # Product price today = ₹70,000
    # Tomorrow admin changes it to ₹75,000
    #
    # Old order must still show ₹70,000.
    # --------------------------------------------------------

    order_items = []

    for item in order_data.items:

        product = product_collection.find_one(
            {
                "productUuid": item.productUuid
            }
        )

        item_price = product["price"]

        selected_variants = getattr(
            item,
            "selectedVariants",
            {}
        )

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

        order_items.append(
            {
                "productUuid": product["productUuid"],
                "name": product["name"],
                "price": item_price,
                "quantity": item.quantity,
                "image_url": product.get("image_url"),
                "selectedVariants": selected_variants
            }
        )

    # --------------------------------------------------------
    # Create order document
    # --------------------------------------------------------

    order = {
        "orderUuid": order_uuid,

        "userUuid": user["userUuid"],

        "items": order_items,

        # IMPORTANT:
        # Use backend-calculated total.
        "total_amount": total_amount,

        "shipping_address": order_data.shipping_address,

        "status": "Processing",

        "created_at": datetime.now(timezone.utc),

        "payment_method": order_data.payment_method
    }

    # --------------------------------------------------------
    # Save order
    # --------------------------------------------------------

    order_collection.insert_one(order)

    # --------------------------------------------------------
    # Reduce product stock
    # --------------------------------------------------------

    for item in order_data.items:

        product_collection.update_one(
            {
                "productUuid": item.productUuid
            },
            {
                "$inc": {
                    "stock": -item.quantity
                }
            }
        )

    return {
        "message": "Order Placed Successfully",
        "orderUuid": order_uuid,
        "total_amount": total_amount
    }


# ============================================================
# GET CURRENT USER ORDERS
# ============================================================

def get_my_orders_service(user):

    # --------------------------------------------------------
    # NEW:
    # Database logic moved from route to service.
    # --------------------------------------------------------

    orders = list(
        order_collection.find(
            {
                "userUuid": user["userUuid"]
            }
        ).sort(
            "created_at",
            -1
        )
    )

    for order in orders:

        # Remove MongoDB internal ID
        order.pop("_id", None)

        # Convert datetime to JSON-friendly format
        if "created_at" in order:
            order["created_at"] = order[
                "created_at"
            ].isoformat()

    return orders


# ============================================================
# ADMIN - GET ALL ORDERS
# ============================================================

def get_all_orders_service():

    # --------------------------------------------------------
    # Get all orders
    # --------------------------------------------------------

    orders = list(
        order_collection.find().sort(
            "created_at",
            -1
        )
    )

    for order in orders:

        # Remove MongoDB internal ID
        order.pop("_id", None)

        # ----------------------------------------------------
        # Get customer information
        # ----------------------------------------------------

        user_uuid = order.get("userUuid")

        user = user_collection.find_one(
            {
                "userUuid": user_uuid
            }
        )

        if user:

            order["userName"] = (
                user.get("name")
                or user.get("username")
                or user.get("email")
                or "Unknown User"
            )

        else:

            order["userName"] = "Unknown User"

        # ----------------------------------------------------
        # Convert datetime
        # ----------------------------------------------------

        if "created_at" in order:

            order["created_at"] = order[
                "created_at"
            ].isoformat()

    return orders


# ============================================================
# ADMIN - UPDATE ORDER STATUS
# ============================================================

def update_order_status_service(order_uuid, status):

    # --------------------------------------------------------
    # Find order
    # --------------------------------------------------------

    order = order_collection.find_one(
        {
            "orderUuid": order_uuid
        }
    )

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    current_status = order.get("status")

    # --------------------------------------------------------
    # Validate status transition
    #
    # Processing → Dispatched
    # Dispatched → Delivered
    # Delivered → cannot change
    # --------------------------------------------------------

    if (
        current_status == "Processing"
        and status != "Dispatched"
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Processing order can only be "
                "changed to Dispatched"
            )
        )

    if (
        current_status == "Dispatched"
        and status != "Delivered"
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Dispatched order can only be "
                "changed to Delivered"
            )
        )

    if current_status == "Delivered":

        raise HTTPException(
            status_code=400,
            detail="Delivered order cannot be changed"
        )

    # --------------------------------------------------------
    # Update status
    # --------------------------------------------------------

    order_collection.update_one(
        {
            "orderUuid": order_uuid
        },
        {
            "$set": {
                "status": status
            }
        }
    )

    return {
        "message": "Order status updated successfully",
        "orderUuid": order_uuid,
        "status": status
    }