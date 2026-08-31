from fastapi import APIRouter, Depends

from models.cart_model import CartItems, CartDeleteItem
from utils.auth import get_current_user

from services.cart_service import (
    add_to_cart,
    get_cart,
    update_cart_quantity,
    remove_from_cart
)


router = APIRouter()


# ============================================================
# ADD TO CART
# ============================================================

@router.post("/cart")
def add_cart_item(
    item: CartItems,
    user: dict = Depends(get_current_user)
):
    return add_to_cart(item, user)


# ============================================================
# GET CART
# ============================================================

@router.get("/cart")
def get_user_cart(
    user: dict = Depends(get_current_user)
):
    return get_cart(user)


# ============================================================
# UPDATE CART QUANTITY
# ============================================================

@router.put("/cart/{productUuid}")
def update_cart_item(
    productUuid: str,
    item: CartItems,
    user: dict = Depends(get_current_user)
):
    return update_cart_quantity(
        productUuid,
        item,
        user
    )


# ============================================================
# REMOVE FROM CART
# ============================================================

@router.delete("/cart/{productUuid}")
def delete_cart_item(
    productUuid: str,
    item: CartDeleteItem,
    user: dict = Depends(get_current_user)
):
    return remove_from_cart(
        productUuid,
        item,
        user
    )