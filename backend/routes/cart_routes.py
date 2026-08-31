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


# from fastapi import APIRouter , Depends , HTTPException
# # from bson import ObjectId
# from models.cart_model import CartItems , CartDeleteItem
# from database.connection import cart_collection , product_collection
# from utils.auth import get_current_user
# from datetime import datetime,timezone
# import uuid

# router = APIRouter()

# #------------------------------------------------------------------------------------------------------
# # Add to Cart
# @router.post ("/cart")
# def add_to_cart(
#     item : CartItems ,
#     user :  dict = Depends(get_current_user)

# ):
    
#     # Check Product already in cart or not
#     product = product_collection.find_one (
#         {
#             "productUuid" :  (item.productUuid)
#         }
#     )

#     if (product is None) :
#         raise HTTPException (
#             status_code=404 , detail="Product Not Found"
#         )

#     userUuid = user["userUuid"]

#     cart = cart_collection.find_one(
#         {
#             "userUuid" : userUuid
#         }
#     )

#     # check cart exist
#     if (cart) :
#         existing_item = next(
#             (
#                 cart_item
#                 for cart_item in cart["items"]
#                 if (
#                     cart_item["productUuid"] == item.productUuid
#                     and
#                     cart_item.get("selectedVariants" , {}) == item.selectedVariants
#                 )
#             ) ,
#             None
#         )

#         if (existing_item):
#             new_quantity = (
#                 existing_item["quantity"] + item.quantity
#             )

#             cart_collection.update_one(
#                 {
#                     "userUuid" : userUuid ,
#                     "items" : {
#                         "$elemMatch": {
#                             "productUuid": item.productUuid,
#                             "selectedVariants": item.selectedVariants
#                             }
#                         }
#                 },
#                 {
#                     "$set" : {
#                         "items.$.quantity" : new_quantity,
#                         "updateAt" : datetime.now(timezone.utc)
#                     }
#                 }
#             )
#         else:
#             cart_collection.update_one(
#                 {
#                     "userUuid" : userUuid
#                 },
#                 {
#                     "$push": {
#                         "items" : item.model_dump() 
#                     },
#                     "$set" :{
#                         "updateAt" : datetime.now(timezone.utc)
#                     }
#                 }
#             )
#     else :
#         cart_collection.insert_one(
#             {
#                 "cartUuid": str(uuid.uuid4()),
#                 "userUuid" : userUuid ,
#                 "items" : [item.model_dump()],
#                 "updateAt" : datetime.now(timezone.utc)
#             }
#         )

#     return {
#             "message" : "Product Added Successfully in Cart" ,
#             "user" : user ,
#             "product" : item
#         }

# #------------------------------------------------------------------------------------------------------

# # GET API
# @router.get("/cart")
# def get_cart(
#     user: dict = Depends(get_current_user)
# ):
#     userUuid = user["userUuid"]

#     cart = cart_collection.find_one(
#         {
#             "userUuid": userUuid
#         }
#     )

#     if cart is None:
#         return {
#             "message": "Cart is Empty",
#             "items": []
#         }

#     cart_items = []

#     # Loop through every cart item
#     for item in cart["items"]:

#         # Find product
#         product = product_collection.find_one(
#             {
#                 "productUuid": item["productUuid"]
#             }
#         )

#         # Skip if product no longer exists
#         if product is None:
#             continue

#         # Selected variants
#         selected_variants = item.get(
#             "selectedVariants",
#             {}
#         )

#         # --------------------------------------------------
#         # Start with normal product price
#         # --------------------------------------------------

#         item_price = product["price"]

#         # --------------------------------------------------
#         # Check variant price
#         # --------------------------------------------------

#         variant_prices = product.get(
#             "variantPrices",
#             {}
#         )

#         if selected_variants and variant_prices:

#             # Build the same key format used by AdminProducts
#             price_key = "|".join(
#                 f"{name}={selected_variants[name]}"
#                 for name in product.get("variants", {}).keys()
#                 if name in selected_variants
#             )

#             # Get variant price
#             item_price = variant_prices.get(
#                 price_key,
#                 product["price"]
#             )

#         # --------------------------------------------------
#         # Add item to response
#         # --------------------------------------------------

#         cart_items.append(
#             {
#                 "productUuid": item["productUuid"],
#                 "name": product["name"],
#                 "price": item_price,
#                 "image_url": product["image_url"],
#                 "quantity": item["quantity"],
#                 "selectedVariants": selected_variants
#             }
#         )

#     return {
#         "cartUuid": cart["cartUuid"],
#         "userUuid": cart["userUuid"],
#         "items": cart_items,
#         "updateAt" : datetime.now(timezone.utc)
#     }

# #------------------------------------------------------------------------------------------------------

# # API for Update cart
# @router.put("/cart/{productUuid}")
# def update_cart_quantity(
#     productUuid : str ,
#     item : CartItems ,
#     user : dict = Depends(get_current_user)
# ) :
#     userUuid = user["userUuid"]

#     cart = cart_collection.find_one(
#         {"userUuid" : userUuid}
#     )

#     if (cart is None):
#         raise HTTPException(
#             status_code=404 , detail="Cart not Found"
#         )

#     result = cart_collection.update_one(
#         {
#             "userUuid" : userUuid,
#              "items" : {
#                  "$elemMatch" : {
#                      "productUuid" : productUuid,
#                      "selectedVariants" : item.selectedVariants
#                  }
#              }
#         },
#         {
#             "$set" : {
#                 "items.$.quantity" : item.quantity,
#                 "updatedAt" : datetime.now(timezone.utc)
#             }
#         }
#     )

#     if ( result.modified_count ==0 ):
#         raise HTTPException(
#             status_code=404 , detail="Product not Found in Cart"
#         )

#     return{
#         "message" : "Cart Quantity Updated Successfully"
#     }

# #------------------------------------------------------------------------------------------------------

# # API for delete from card
# @router.delete("/cart/{productUuid}")
# def remove_from_cart(
#     productUuid: str,
#     item : CartDeleteItem,
#     user : dict = Depends(get_current_user)
# ):

#     userUuid = user["userUuid"]

#     cart = cart_collection.find_one(
#         {"userUuid": userUuid}
#     )

#     if ( cart is None ) :
#         raise HTTPException(
#             status_code=404, detail="Cart not found"
#         )

#     result = cart_collection.update_one(
#         {"userUuid": userUuid},
#         {
#             "$pull": {
#                 "items": {
#                     "productUuid": productUuid ,
#                     "selectedVariants" : item.selectedVariants
#                 }
#             },
#             "$set" : {
#                 "updatedAt" : datetime.now(timezone.utc)
#             }
#         }
#     )

#     if ( result.modified_count == 0 ) :
#         raise HTTPException(
#             status_code=404, detail="Product not found in cart"
#         )

#     return {
#         "message": "Product removed from cart"
#     }

# #------------------------------------------------------------------------------------------------------