from datetime import datetime, timezone
import time
from typing import Optional
from database.connection import product_collection
from utils.logger import logger


def _normalize_product(product: Optional[dict]) -> Optional[dict]:
    """Ensure optional fields exist so older products keep working unchanged."""

    if not product:
        return product

    product.pop("_id", None)

    images = product.get("images")
    if not isinstance(images, list):
        product["images"] = []
    else:
        product["images"] = [
            url.strip()
            for url in images
            if isinstance(url, str) and url.strip()
        ]

    return product


# ============================================================
# CREATE PRODUCT
# ============================================================

def create_product(product_dict: dict):

    now = datetime.now(timezone.utc)

    # Keep both existing timestamp formats
    product_dict["created_at"] = now
    product_dict["updated_at"] = now
    product_dict["createdAt"] = now
    product_dict["updatedAt"] = now

    product_collection.insert_one(product_dict)

    logger.info(
        "product_created",
        product_uuid=product_dict.get("productUuid"),
        product_name=product_dict.get("name"),
    )

    return {
        "message": "Product created successfully",
        "productUuid": product_dict["productUuid"],
    }


# ============================================================
# GET ALL PRODUCTS
# ============================================================

def get_all_products():

    start = time.perf_counter()

    products = list(product_collection.find())

    print(
        "MongoDB query:",
        round((time.perf_counter() - start) * 1000, 2),
        "ms"
    )

    start = time.perf_counter()

    for index, product in enumerate(products):
        products[index] = _normalize_product(product)

    print(
        "Processing:",
        round((time.perf_counter() - start) * 1000, 2),
        "ms"
    )
    return products


# ============================================================
# SEARCH PRODUCTS
# ============================================================

def search_products(query: str):

    if not query.strip():
        logger.info("product_search_empty")
        return []

    products = list(
        product_collection.find(
            {
                "name": {
                    "$regex": query,
                    "$options": "i",
                }
            }
        )
    )

    for index, product in enumerate(products):
        products[index] = _normalize_product(product)

    logger.info(
        "products_searched",
        query=query,
        count=len(products),
    )

    return products


# ============================================================
# PRODUCTS BY CATEGORY
# ============================================================

def get_products_by_category(category: str):

    products = list(
        product_collection.find(
            {
                "category": {
                    "$regex": f"^{category}$",
                    "$options": "i",
                }
            }
        )
    )

    for index, product in enumerate(products):
        products[index] = _normalize_product(product)

    logger.info(
        "products_fetched_by_category",
        category=category,
        count=len(products),
    )

    return products


# ============================================================
# GET SINGLE PRODUCT
# ============================================================

def get_product_by_uuid(product_uuid: str):

    logger.info(
        "fetching_product",
        product_uuid=product_uuid,
    )

    product = product_collection.find_one(
        {
            "productUuid": product_uuid
        }
    )

    if product:

        logger.info(
            "product_fetched",
            product_uuid=product_uuid,
        )

        return _normalize_product(product)

    logger.warning(
        "product_not_found",
        product_uuid=product_uuid,
    )

    return None


# ============================================================
# UPDATE PRODUCT
# ============================================================

def update_product(
    product_uuid: str,
    product_data: dict,
):

    now = datetime.now(timezone.utc)

    # Keep both timestamp formats
    product_data["updated_at"] = now
    product_data["updatedAt"] = now

    result = product_collection.update_one(
        {
            "productUuid": product_uuid
        },
        {
            "$set": product_data
        }
    )

    if result.matched_count == 0:

        logger.warning(
            "product_update_failed",
            product_uuid=product_uuid,
        )

        return False

    logger.info(
        "product_updated",
        product_uuid=product_uuid,
    )

    return True


# ============================================================
# DELETE PRODUCT
# ============================================================

def delete_product(product_uuid: str):

    result = product_collection.delete_one(
        {
            "productUuid": product_uuid
        }
    )

    if result.deleted_count == 1:

        logger.info(
            "product_deleted",
            product_uuid=product_uuid,
        )

        return True

    logger.warning(
        "product_delete_failed",
        product_uuid=product_uuid,
    )

    return False