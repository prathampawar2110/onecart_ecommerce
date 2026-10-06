# this security.py is used for to generate and verify JWT Token

from passlib.context import CryptContext
# CryptContext manages password hashing. It knows which algorithm to use, how to verify passwords

from datetime import datetime, timedelta, timezone
from jose import jwt

# ======================= NEW =======================
import os
from dotenv import load_dotenv

# Load variables from .env
load_dotenv()
# ===================================================


pwd_context = CryptContext(
    schemes=["bcrypt"],                      # Why bcrypt? Because storing passwords directly is unsafe.
    deprecated="auto"
)


# ======================= CHANGED ===================
# Before:
# SECRET_KEY = "your_super_secret_key_change_this_in_production"

# Now:
SECRET_KEY = os.getenv("SECRET_KEY")
# ===================================================


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# To generate JWT token function
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


#------------------------------------------------------------------------------------------------------------

# JWT Verification
def verify_access_token(token: str):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        userUuid = payload.get("userUuid")
        # email = payload.get("sub")

        if userUuid is None:
            return None

        return userUuid

    except Exception:
        return None