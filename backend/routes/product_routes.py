from fastapi import APIRouter, Depends

from models.product_model import Product
from utils.auth import get_current_admin

from services.product_service import (
    create_product as create_product_service,
    get_all_products,
    search_products as search_products_service,
    get_products_by_category,
    get_product_by_uuid,
    update_product as update_product_service,
    delete_product as delete_product_service,
)


router = APIRouter()


# ============================================================
# CREATE PRODUCT
# ============================================================

@router.post("/products")
def create_product(
    product: Product,
    admin: dict = Depends(get_current_admin)
):

    return create_product_service(
        product.model_dump()
    )


# ============================================================
# GET ALL PRODUCTS
# ============================================================

@router.get("/products")
def get_product():

    return get_all_products()
    

# ============================================================
# SEARCH PRODUCTS
# ============================================================

@router.get("/products/search")
def search_products(query: str):

    return search_products_service(query)


# ============================================================
# PRODUCTS BY CATEGORY
# ============================================================

@router.get("/products/category/{category}")
def get_product_by_category(category: str):

    return get_products_by_category(category)


# ============================================================
# GET SINGLE PRODUCT
# ============================================================

@router.get("/products/{product_uuid}")
def get_product_by_id(product_uuid: str):

    product = get_product_by_uuid(product_uuid)

    if product:
        return product

    return {
        "message": "Product not found"
    }


# ============================================================
# UPDATE PRODUCT
# ============================================================

@router.put("/products/{product_uuid}")
def update_product(
    product_uuid: str,
    product: Product,
    admin: dict = Depends(get_current_admin)
):

    product_data = product.model_dump(
        exclude={
            "productUuid",
            "created_at",
            "updated_at",
            "createdAt",
            "updatedAt",
        }
    )

    updated = update_product_service(
        product_uuid,
        product_data,
    )

    if not updated:
        return {
            "message": "Product Not Found"
        }

    return {
        "message": "Product Updated Successfully"
    }


# ============================================================
# DELETE PRODUCT
# ============================================================

@router.delete("/products/{product_uuid}")
def delete_product(
    product_uuid: str,
    admin: dict = Depends(get_current_admin)
):

    deleted = delete_product_service(
        product_uuid
    )

    if deleted:
        return {
            "message": "Product Deleted Successfully"
        }

    return {
        "message": "Product Not Found"
    }