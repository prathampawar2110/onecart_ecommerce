from pymongo import MongoClient

# Connect to the MongoDB server running on localhost at port 27017
client = MongoClient("mongodb://localhost:27017/")  

# Select the database as "onecart_db"
db = client["onecart_db"]            #if db is not present then it will be created automatically when we insert data into it.

# Select the collection as "products"
product_collection = db["products"]    #if collection is not present then it will be created.