from fastapi import APIRouter, HTTPException, Depends

from models.order_model import OrderCreate
from utils.auth import get_current_user, get_current_admin

# ============================================================
# NEW: Import service functions
# ============================================================
# WHY:
# The business logic has been moved from this route file
# into order_service.py.
#
# Route = handles API request/authentication
# Service = handles order logic/database operations
# ============================================================

from services.order_service import (
    create_order_service,
    get_my_orders_service,
    get_all_orders_service,
    update_order_status_service,
)


router = APIRouter()


# ============================================================
# CUSTOMER API
# ============================================================

# ------------------------------------------------------------
# CREATE ORDER
# ------------------------------------------------------------
@router.post("/orders")
def create_order(
    order_data: OrderCreate,
    user: dict = Depends(get_current_user)
):
    # ========================================================
    # CHANGED:
    # All order creation logic is now inside the service.
    #
    # BEFORE:
    # This route was checking:
    # - empty cart
    # - product existence
    # - stock
    # - generating UUID
    # - creating order
    # - reducing stock
    #
    # NOW:
    # Route only calls the service.
    # ========================================================

    return create_order_service(
        order_data,
        user
    )


# ------------------------------------------------------------
# GET CURRENT USER ORDERS
# ------------------------------------------------------------
@router.get("/orders/my-orders")
def get_my_orders(
    user: dict = Depends(get_current_user)
):
    # ========================================================
    # CHANGED:
    # MongoDB query and order formatting moved to service.
    # ========================================================

    return get_my_orders_service(user)


# ============================================================
# ADMIN API
# ============================================================

# ------------------------------------------------------------
# ADMIN - GET ALL ORDERS
# ------------------------------------------------------------
@router.get("/admin/orders")
def get_all_orders(
    admin: dict = Depends(get_current_admin)
):
    # ========================================================
    # CHANGED:
    # Getting all orders and finding customer names
    # is now handled by order_service.py.
    # ========================================================

    return get_all_orders_service()


# ------------------------------------------------------------
# ADMIN - UPDATE ORDER STATUS
# ------------------------------------------------------------
@router.put("/admin/orders/{orderUuid}/status")
def update_order_status(
    orderUuid: str,
    status: str,
    admin: dict = Depends(get_current_admin)
):
    # ========================================================
    # CHANGED:
    # Status validation and MongoDB update moved to service.
    # ========================================================

    return update_order_status_service(
        orderUuid,
        status
    )