from fastapi import APIRouter, Depends

from models.user_model import User, UserLogin
from models.profile_model import (
    ProfileUpdate,
    AddressUpdate,
    AddressCreate
)

from utils.auth import get_current_user
from utils.permissions import require_admin

from services.user_service import (
    register_user_service,
    login_user_service,
    get_current_user_service,
    update_profile_service,
    get_addresses_service,
    add_address_service,
    update_address_service,
    delete_address_service,
    get_all_users_service
)


router = APIRouter()


# ============================================================
# REGISTER
# ============================================================

@router.post("/users/register")
def register_user(us: User):

    return register_user_service(us)


# ============================================================
# LOGIN
# ============================================================

@router.post("/users/login")
def login_user(use_variable: UserLogin):

    return login_user_service(use_variable)


# ============================================================
# CURRENT USER
# ============================================================

@router.get("/users/me")
def get_current_user_info(
    user: dict = Depends(get_current_user)
):

    return get_current_user_service(user)


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put("/users/me")
def update_profile(
    profile_data: ProfileUpdate,
    user: dict = Depends(get_current_user)
):

    return update_profile_service(
        profile_data,
        user
    )


# ============================================================
# GET ADDRESSES
# ============================================================

@router.get("/users/me/addresses")
def get_addresses(
    user: dict = Depends(get_current_user)
):

    return get_addresses_service(user)


# ============================================================
# ADD ADDRESS
# ============================================================

@router.post("/users/me/addresses")
def add_address(
    address_data: AddressCreate,
    user: dict = Depends(get_current_user)
):

    return add_address_service(
        address_data,
        user
    )


# ============================================================
# UPDATE ADDRESS
# ============================================================

@router.put("/users/me/addresses/{addressUuid}")
def update_address(
    addressUuid: str,
    address_data: AddressUpdate,
    user: dict = Depends(get_current_user)
):

    return update_address_service(
        addressUuid,
        address_data,
        user
    )


# ============================================================
# DELETE ADDRESS
# ============================================================

@router.delete("/users/me/addresses/{addressUuid}")
def delete_address(
    addressUuid: str,
    user: dict = Depends(get_current_user)
):

    return delete_address_service(
        addressUuid,
        user
    )


# ============================================================
# ADMIN TEST
# ============================================================

@router.get("/admin/test")
def admin_test(
    user: dict = Depends(get_current_user)
):

    require_admin(user)

    return {
        "message": "Welcome Admin",
        "admin": user["email"]
    }


# ============================================================
# ADMIN - GET ALL USERS
# ============================================================

@router.get("/admin/users")
def get_all_users(
    admin: dict = Depends(get_current_user)
):

    require_admin(admin)

    return get_all_users_service()