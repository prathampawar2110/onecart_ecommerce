from fastapi import APIRouter, Depends, HTTPException

from models.category_model import Category
from database.connection import category_collection
from utils.auth import get_current_admin

import uuid
from datetime import datetime, timezone


router = APIRouter()


# ------------------------------------------------------------
# Get all categories
# ------------------------------------------------------------

@router.get("/categories")
def get_categories():

    categories = list(
        category_collection.find(
            {},
            {
                "_id": 0,
                "categoryUuid": 1,
                "name": 1,
                "slug": 1,
                "createdAt" : 1
            }
        )
    )

    return {
        "items": categories
    }


# ------------------------------------------------------------
# Create category - Admin only
# ------------------------------------------------------------

@router.post("/categories")
def create_category(
    category: Category,
    user: dict = Depends(get_current_admin)
):

    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    existing = category_collection.find_one({
        "name": category.name
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    category_uuid = str(uuid.uuid4())

    category_data = {
        "categoryUuid": category_uuid,
        "name": category.name,
        "slug": category.name.lower().replace(" ", "-"),
        "createdAt": datetime.now(timezone.utc)
    }

    category_collection.insert_one(category_data)

    return {
        "category": {
            "categoryUuid": category_uuid,
            "name": category.name,
            "slug": category_data["slug"],
            "createdAt": category_data["createdAt"]
        }
    }


# ------------------------------------------------------------
# Update category - Admin only
# ------------------------------------------------------------

@router.put("/categories/{categoryUuid}")
def update_category(
    categoryUuid: str,
    category: Category,
    user: dict = Depends(get_current_admin)
):

    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    existing = category_collection.find_one({
        "categoryUuid": categoryUuid
    })

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    new_slug = category.name.lower().replace(" ", "-")

    category_collection.update_one(
        {"categoryUuid": categoryUuid},
        {
            "$set": {
                "name": category.name,
                "slug": new_slug
            }
        }
    )

    return {
        "category": {
            "categoryUuid": categoryUuid,
            "name": category.name,
            "slug": new_slug
        }
    }

# ------------------------------------------------------------
# Delete category - Admin only
# ------------------------------------------------------------

@router.delete("/categories/{categoryUuid}")
def delete_category(
    categoryUuid: str,
    user: dict = Depends(get_current_admin)
):

    # Check whether category exists
    existing = category_collection.find_one({
        "categoryUuid": categoryUuid
    })

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    # Check whether products are using this category
    from database.connection import product_collection

    products_exist = product_collection.find_one({
        "category": existing["name"]
    })

    if products_exist:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete category because products exist in this category"
        )

    # Delete category
    category_collection.delete_one({
        "categoryUuid": categoryUuid
    })

    return {
        "success": True
    }


# from fastapi import APIRouter, Depends, HTTPException

# from models.category_model import Category
# from database.connection import category_collection
# from utils.auth import get_current_admin

# import uuid
# from datetime import datetime, timezone


# router = APIRouter()


# # ------------------------------------------------------------
# # Get all categories
# # ------------------------------------------------------------

# @router.get("/categories")
# def get_categories():

#     categories = list(
#         category_collection.find(
#             {},
#             {
#                 "_id": 0,
#                 "categoryUuid": 1,
#                 "name": 1,
#                 "slug": 1,
#                 "createdAt" : 1
#             }
#         )
#     )

#     return {
#         "items": categories
#     }


# # ------------------------------------------------------------
# # Create category - Admin only
# # ------------------------------------------------------------

# @router.post("/categories")
# def create_category(
#     category: Category,
#     user: dict = Depends(get_current_admin)
# ):

#     if user.get("role") != "admin":
#         raise HTTPException(
#             status_code=403,
#             detail="Admin access required"
#         )

#     existing = category_collection.find_one({
#         "name": category.name
#     })

#     if existing:
#         raise HTTPException(
#             status_code=400,
#             detail="Category already exists"
#         )

#     category_uuid = str(uuid.uuid4())

#     category_data = {
#         "categoryUuid": category_uuid,
#         "name": category.name,
#         "slug": category.name.lower().replace(" ", "-"),
#         "createdAt": datetime.now(timezone.utc)
#     }

#     category_collection.insert_one(category_data)

#     return {
#         "category": {
#             "categoryUuid": category_uuid,
#             "name": category.name,
#             "slug": category_data["slug"],
#             "createdAt": category_data["createdAt"]
#         }
#     }


# # ------------------------------------------------------------
# # Update category - Admin only
# # ------------------------------------------------------------

# @router.put("/categories/{categoryUuid}")
# def update_category(
#     categoryUuid: str,
#     category: Category,
#     user: dict = Depends(get_current_admin)
# ):

#     if user.get("role") != "admin":
#         raise HTTPException(
#             status_code=403,
#             detail="Admin access required"
#         )

#     existing = category_collection.find_one({
#         "categoryUuid": categoryUuid
#     })

#     if not existing:
#         raise HTTPException(
#             status_code=404,
#             detail="Category not found"
#         )

#     new_slug = category.name.lower().replace(" ", "-")

#     category_collection.update_one(
#         {"categoryUuid": categoryUuid},
#         {
#             "$set": {
#                 "name": category.name,
#                 "slug": new_slug
#             }
#         }
#     )

#     return {
#         "category": {
#             "categoryUuid": categoryUuid,
#             "name": category.name,
#             "slug": new_slug
#         }
#     }

# # ------------------------------------------------------------
# # Delete category - Admin only
# # ------------------------------------------------------------

# @router.delete("/categories/{categoryUuid}")
# def delete_category(
#     categoryUuid: str,
#     user: dict = Depends(get_current_admin)
# ):

#     # Check whether category exists
#     existing = category_collection.find_one({
#         "categoryUuid": categoryUuid
#     })

#     if not existing:
#         raise HTTPException(
#             status_code=404,
#             detail="Category not found"
#         )

#     # Check whether products are using this category
#     from database.connection import product_collection

#     products_exist = product_collection.find_one({
#         "category": existing["name"]
#     })

#     if products_exist:
#         raise HTTPException(
#             status_code=409,
#             detail="Cannot delete category because products exist in this category"
#         )

#     # Delete category
#     category_collection.delete_one({
#         "categoryUuid": categoryUuid
#     })

#     return {
#         "success": True
#     }