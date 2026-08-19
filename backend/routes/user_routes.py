from fastapi import APIRouter, HTTPException, Depends
from models.user_model import User, UserLogin
from models.profile_model import (ProfileUpdate, AddressUpdate, AddressCreate)
from database.connection import user_collection
from utils.security import (
    hash_password,
    verify_password,
    create_access_token
)
from utils.auth import get_current_user
from utils.permissions import require_admin
from datetime import datetime,timezone

from bson import ObjectId

import uuid

# ----------------------------------------------------------------------------------------------------------
# Router
# ----------------------------------------------------------------------------------------------------------

router = APIRouter()


# ----------------------------------------------------------------------------------------------------------
# Register User
# ----------------------------------------------------------------------------------------------------------

@router.post("/users/register")
def register_user(us: User):

    existing_user = user_collection.find_one(
        {
            "email": us.email
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email Already Registered"
        )

    hashed_password = hash_password(
        us.password
    )

    user_data = {
        "userUuid": us.userUuid,
        "name": us.name,
        "email": us.email,
        "password": hashed_password,
        "role": "customer",
        "phone": us.phone,
        "createdAt":datetime.now(timezone.utc),

        # Multiple addresses
        "addresses": [
            address.model_dump()
            for address in us.addresses
        ]
    }

    user_collection.insert_one(user_data)

    return {
        "message": "user registered successfully",
        "userUuid": us.userUuid
    }


# ----------------------------------------------------------------------------------------------------------
# Login API
# ----------------------------------------------------------------------------------------------------------

@router.post("/users/login")
def login_user(use_variable: UserLogin):

    existing_user = user_collection.find_one(
        {
            "email": use_variable.email
        }
    )

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        use_variable.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": existing_user["email"],
            "userUuid": existing_user["userUuid"]
        }
    )

    return {
        "message": "Login Successful",
        "access_token": access_token,
        "token_type": "bearer"
    }


# ----------------------------------------------------------------------------------------------------------
# Get Current Logged-in User
# ----------------------------------------------------------------------------------------------------------

@router.get("/users/me")
def get_current_user_info(
    user: dict = Depends(get_current_user)
):

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User Not Found"
        )

    # ----------------------------------------------------------
    # Migrate old single address if it exists
    # ----------------------------------------------------------

    addresses = user.get("addresses", [])

    old_address = user.get("address")

    if not addresses and old_address:

        migrated_address = {
            "addressUuid": str(uuid.uuid4()),
            "label": "Home",
            "street": old_address.get("street", ""),
            "city": old_address.get("city", ""),
            "state": old_address.get("state", ""),
            "pincode": old_address.get("pincode", "")
        }

        addresses = [migrated_address]

        # Save migrated address
        user_collection.update_one(
            {
                "_id": ObjectId(user["_id"])
            },
            {
                "$set": {
                    "addresses": addresses
                },
                "$unset": {
                    "address": ""
                }
            }
        )

    return {
        "userUuid": user["userUuid"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],

        "phone": user.get("phone"),

        "addresses": addresses
    }


# ----------------------------------------------------------------------------------------------------------
# Update Profile - Phone Only
# ----------------------------------------------------------------------------------------------------------

@router.put("/users/me")
def update_profile(
    profile_data: ProfileUpdate,
    user: dict = Depends(get_current_user)
):

    result = user_collection.update_one(
        {
            "_id": ObjectId(user["_id"])
        },
        {
            "$set": {
                "phone": profile_data.phone
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User Not Found"
        )

    updated_user = user_collection.find_one(
        {
            "_id": ObjectId(user["_id"])
        }
    )

    return {
        "userUuid": updated_user["userUuid"],
        "name": updated_user["name"],
        "email": updated_user["email"],
        "role": updated_user["role"],

        "phone": updated_user.get("phone"),

        "addresses": updated_user.get(
            "addresses",
            []
        )
    }


# ----------------------------------------------------------------------------------------------------------
# Get All Saved Addresses
# ----------------------------------------------------------------------------------------------------------

@router.get("/users/me/addresses")
def get_addresses(
    user: dict = Depends(get_current_user)
):

    addresses = user.get(
        "addresses",
        []
    )

    # ----------------------------------------------------------
    # Migrate old address if necessary
    # ----------------------------------------------------------

    old_address = user.get("address")

    if not addresses and old_address:

        migrated_address = {
            "addressUuid": str(uuid.uuid4()),
            "label": "Home",
            "street": old_address.get("street", ""),
            "city": old_address.get("city", ""),
            "state": old_address.get("state", ""),
            "pincode": old_address.get("pincode", "")
        }

        addresses = [migrated_address]

        user_collection.update_one(
            {
                "_id": ObjectId(user["_id"])
            },
            {
                "$set": {
                    "addresses": addresses
                },
                "$unset": {
                    "address": ""
                }
            }
        )

    return addresses


# ----------------------------------------------------------------------------------------------------------
# Add New Address
# ----------------------------------------------------------------------------------------------------------

@router.post("/users/me/addresses")
def add_address(
    address_data: AddressCreate,
    user: dict = Depends(get_current_user)
):

    new_address = {
        "addressUuid": str(uuid.uuid4()),
        **address_data.model_dump()
    }

    result = user_collection.update_one(
        {
            "_id": ObjectId(user["_id"])
        },
        {
            "$push": {
                "addresses": new_address
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User Not Found"
        )

    return {
        "message": "Address added successfully",
        "address": new_address
    }


# ----------------------------------------------------------------------------------------------------------
# Update Existing Address
# ----------------------------------------------------------------------------------------------------------

@router.put("/users/me/addresses/{addressUuid}")
def update_address(
    addressUuid: str,
    address_data: AddressUpdate,
    user: dict = Depends(get_current_user)
):

    addresses = user.get(
        "addresses",
        []
    )

    address_found = False

    for address in addresses:

        if address.get("addressUuid") == addressUuid:

            address["label"] = address_data.label
            address["street"] = address_data.street
            address["city"] = address_data.city
            address["state"] = address_data.state
            address["pincode"] = address_data.pincode

            address_found = True
            break

    if not address_found:
        raise HTTPException(
            status_code=404,
            detail="Address Not Found"
        )

    user_collection.update_one(
        {
            "_id": ObjectId(user["_id"])
        },
        {
            "$set": {
                "addresses": addresses
            }
        }
    )

    return {
        "message": "Address updated successfully",
        "address": address
    }


# ----------------------------------------------------------------------------------------------------------
# Delete Address
# ----------------------------------------------------------------------------------------------------------

@router.delete("/users/me/addresses/{addressUuid}")
def delete_address(
    addressUuid: str,
    user: dict = Depends(get_current_user)
):

    addresses = user.get(
        "addresses",
        []
    )

    updated_addresses = [
        address
        for address in addresses
        if address.get("addressUuid") != addressUuid
    ]

    if len(updated_addresses) == len(addresses):

        raise HTTPException(
            status_code=404,
            detail="Address Not Found"
        )

    user_collection.update_one(
        {
            "_id": ObjectId(user["_id"])
        },
        {
            "$set": {
                "addresses": updated_addresses
            }
        }
    )

    return {
        "message": "Address deleted successfully"
    }


# ----------------------------------------------------------------------------------------------------------
# Admin API
# ----------------------------------------------------------------------------------------------------------

@router.get("/admin/test")
def admin_test(
    user=Depends(get_current_user)
):

    require_admin(user)

    return {
        "message": "Welcome Admin",
        "admin": user["email"]
    }


# ----------------------------------------------------------------------------------------------------------
# Admin - Get All Users
# ----------------------------------------------------------------------------------------------------------

@router.get("/admin/users")
def get_all_users(
    admin: dict = Depends(get_current_user)
):

    require_admin(admin)

    users = list(
        user_collection.find(
            {},
            {
                "_id": 0,
                "password": 0
            }
        )
    )

    return users