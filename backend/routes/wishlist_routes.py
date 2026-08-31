from fastapi import APIRouter, Depends

from models.wishlist_model import WishlistItem
from utils.auth import get_current_user

from services.wishlist_service import (
    add_to_wishlist,
    get_wishlist,
    remove_from_wishlist
)


router = APIRouter()


# ============================================================
# ADD TO WISHLIST
# ============================================================

@router.post("/wishlist")
def add_wishlist_item(
    item: WishlistItem,
    user: dict = Depends(get_current_user)
):
    return add_to_wishlist(item, user)


# ============================================================
# GET WISHLIST
# ============================================================

@router.get("/wishlist")
def get_user_wishlist(
    user: dict = Depends(get_current_user)
):
    return get_wishlist(user)


# ============================================================
# REMOVE FROM WISHLIST
# ============================================================

@router.delete("/wishlist/{productUuid}")
def delete_wishlist_item(
    productUuid: str,
    user: dict = Depends(get_current_user)
):
    return remove_from_wishlist(
        productUuid,
        user
    )