import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()

# Get MongoDB URL from .env
MONGO_URL = os.getenv("MONGO_URL")

# Connect to MongoDB
client = MongoClient(MONGO_URL)

# Select the database
db = client["onecart"]

# Products
product_collection = db["products"]

# Users
user_collection = db["users"]

# Cart
cart_collection = db["carts"]

# Wishlist
wishlist_collection = db["wishlist"]

# Orders
order_collection = db["orders"]

# Categories
category_collection = db["categories"]