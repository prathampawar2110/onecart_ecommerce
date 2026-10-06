from utils.logger import configure_logging, logger

from fastapi import FastAPI, Request

from routes.product_routes import router as product_router
from routes.user_routes import router as user_router
from routes.cart_routes import router as cart_router
from routes.wishlist_routes import router as wishlist_router
from routes.order_routes import router as order_router
from routes.category_routes import router as category_router
from routes.chat_routes import router as chat_router

from fastapi.middleware.cors import CORSMiddleware

import time


# ==========================================================
# CONFIGURE LOGGING
# ==========================================================

configure_logging()

app = FastAPI()


# ==========================================================
# REQUEST LOGGING MIDDLEWARE
# ==========================================================

@app.middleware("http")
async def log_requests(request: Request, call_next):

    start_time = time.perf_counter()

    try:
        response = await call_next(request)

        duration = (time.perf_counter() - start_time) * 1000

        logger.info(
            "http_request",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(duration, 2),
        )

        return response

    except Exception:

        duration = (time.perf_counter() - start_time) * 1000

        logger.exception(
            "http_request_failed",
            method=request.method,
            path=request.url.path,
            duration_ms=round(duration, 2),
        )

        raise


# ==========================================================
# ROUTERS
# ==========================================================

app.include_router(product_router)
app.include_router(user_router)
app.include_router(cart_router)
app.include_router(wishlist_router)
app.include_router(order_router)
app.include_router(category_router)
app.include_router(chat_router)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# HOME
# ==========================================================

@app.get("/")
def home():

    logger.info(
        "home_endpoint_called"
    )

    return {
        "message": "Welcome to Backend"
    }