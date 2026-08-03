from fastapi import FastAPI
from routes.product_routes import router                #This imports the router we created in product_routes.py.
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware (
    CORSMiddleware,
    allow_origins = origins ,
    allow_credentials = True ,
    allow_methods = ["*"] ,
    allow_headers = ["*"] ,
)

@app.get("/")
def home():
    return {
        "message" : "Welcome to Backend"
    }

app.include_router(router)