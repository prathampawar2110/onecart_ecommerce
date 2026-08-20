from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGO_URL ")
DATABASE_NAME = os.getenv("DB_NAME")