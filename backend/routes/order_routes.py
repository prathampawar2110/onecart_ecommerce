from fastapi import APIRouter, HTTPException, Depends

from models.order_model import OrderCreate
from database.connection import order_collection, product_collection,user_collection
from utils.auth import get_current_user , get_current_admin

from datetime import datetime, timezone
import uuid


router = APIRouter()


# -------------------------------------------------Customer API-----------------------------------------------------------------------------------

# Create Order

@router.post("/orders")
def create_order(
    order_data: OrderCreate,
    user: dict = Depends(get_current_user)
):

    # To Check that cart is not empty
    if not order_data.items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty"
        )

    # To Check every product before creating order
    for item in order_data.items:

        # Find product using productUuid
        product = product_collection.find_one(
            {
                "productUuid": item.productUuid
            }
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product not found: {item.name}"
            )

        # To Check stock
        if product["stock"] < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for {item.name}. Available stock: {product['stock']}"
            )

    # Generate Order UUID
    order_uuid = str(uuid.uuid4())

    # Create order
    order = {

        "orderUuid": order_uuid,

        "userUuid": user["userUuid"],

        "items": [
            item.model_dump()
            for item in order_data.items
        ],

        "total_amount": order_data.total_amount,

        "shipping_address": order_data.shipping_address,

        "status": "Processing",

        "created_at": datetime.now(timezone.utc),

        "payment_method" : order_data.payment_method
    }

    # Save Order
    order_collection.insert_one(order)

    # Reduce product stock
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

        "orderUuid": order_uuid
    }


# -------------------------------------------------------------------------------------------------------------------------------------
# Get Current User Orders

@router.get("/orders/my-orders")
def get_my_orders(
    user: dict = Depends(get_current_user)
):

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

        if "created_at" in order:
            order["created_at"] = order[
                "created_at"
            ].isoformat()

    return orders

#-----------------------------------------------------------------------------------------------------------------------------------------------

# -------------------------------------------------Admin API----------------------------------------------------------------------------------


# Admin - Get All Orders

# Admin - Get All Orders

@router.get("/admin/orders")
def get_all_orders(
    admin: dict = Depends(get_current_admin)
):

    orders = list(
        order_collection.find().sort(
            "created_at",
            -1
        )
    )

    for order in orders:

        # Remove MongoDB internal ID
        order.pop("_id", None)

        # -------------------------------------------------
        # Get customer name using userUuid
        # -------------------------------------------------

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

        # -------------------------------------------------
        # Convert datetime to JSON-friendly string
        # -------------------------------------------------

        if "created_at" in order:
            order["created_at"] = order[
                "created_at"
            ].isoformat()

    return orders

# @router.get("/admin/orders")
# def get_all_orders(
#     admin: dict = Depends(get_current_admin)
# ):

#     orders = list(
#         order_collection.find().sort(
#             "created_at",
#             -1
#         )
#     )

#     for order in orders:

#         # Remove MongoDB internal ID
#         order.pop("_id", None)

#         # Get customer name using userUuid
#         user = user_collection.find_one(
#             {
#                 "userUuid" : order["userUuid"]
#             }
#         )

#         # Convert datetime to JSON-friendly string
#         if "created_at" in order:
#             order["created_at"] = order[
#                 "created_at"
#             ].isoformat()

#     return orders

#-----------------------------------------------------------------------------------------------------------------------------------------------

# Admin - Update Order Status

@router.put("/admin/orders/{orderUuid}/status")
def update_order_status(
    orderUuid: str,
    status: str,
    admin: dict = Depends(get_current_admin)
):

    # Find order
    order = order_collection.find_one(
        {
            "orderUuid": orderUuid
        }
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    current_status = order.get("status")

    # Allowed status transitions
    if current_status == "Processing" and status != "Dispatched":

        raise HTTPException(
            status_code=400,
            detail="Processing order can only be changed to Dispatched"
        )

    if current_status == "Dispatched" and status != "Delivered":

        raise HTTPException(
            status_code=400,
            detail="Dispatched order can only be changed to Delivered"
        )

    if current_status == "Delivered":

        raise HTTPException(
            status_code=400,
            detail="Delivered order cannot be changed"
        )

    # Update status
    order_collection.update_one(
        {
            "orderUuid": orderUuid
        },
        {
            "$set": {
                "status": status
            }
        }
    )

    return {
        "message": "Order status updated successfully",
        "orderUuid": orderUuid,
        "status": status
    }