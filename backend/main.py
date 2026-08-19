from fastapi import FastAPI
from routes.product_routes import router as product_router                #This imports the router we created in product_routes.py.
from routes.user_routes import router as user_router
from routes.cart_routes import router as cart_router
from routes.wishlist_routes import router as wishlist_router
from routes.order_routes import router as order_router
from routes.category_routes import router as category_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.include_router(product_router)
app.include_router(user_router)
app.include_router(cart_router)
app.include_router(wishlist_router)
app.include_router(order_router)
app.include_router(category_router)


# origins = [
#     "http://localhost:3000"
# ]

app.add_middleware (
    CORSMiddleware,
    allow_origins = ["http://localhost:3000" ],
    allow_credentials = True ,
    allow_methods = ["*"] ,
    allow_headers = ["*"] ,
)

@app.get("/")
def home():
    return {
        "message" : "Welcome to Backend"
    }

# for route in app.routes:
#     print(route.path , route.include_in_schema)