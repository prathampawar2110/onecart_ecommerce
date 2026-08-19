from database.connection import product_collection
from datetime import datetime, timezone


products = list(product_collection.find())

for product in products:

    update_data = {}

    # --------------------------------------------------
    # UUID migration
    # --------------------------------------------------

    if "productUuid" not in product:

        if "product_uuid" in product:
            update_data["productUuid"] = product["product_uuid"]

    # --------------------------------------------------
    # Date migration
    # --------------------------------------------------

    if "createdAt" not in product:

        if "created_at" in product:
            update_data["createdAt"] = product["created_at"]

        else:
            update_data["createdAt"] = datetime.now(timezone.utc)

    if "updatedAt" not in product:

        if "updated_at" in product:
            update_data["updatedAt"] = product["updated_at"]

        else:
            update_data["updatedAt"] = datetime.now(timezone.utc)

    # --------------------------------------------------
    # Variant price migration
    # --------------------------------------------------

    if "variantPrices" not in product:

        if "variant_prices" in product:
            update_data["variantPrices"] = product["variant_prices"]

    # --------------------------------------------------
    # Apply update
    # --------------------------------------------------

    if update_data:

        product_collection.update_one(
            {
                "_id": product["_id"]
            },
            {
                "$set": update_data
            }
        )

        print(
            "Migrated:",
            update_data.get("productUuid")
        )


print("Migration completed.")

