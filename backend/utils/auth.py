# Create a dependency for protected routes

from fastapi import Depends , HTTPException
from fastapi.security import HTTPBearer , HTTPAuthorizationCredentials

from utils.security import verify_access_token
from database.connection import user_collection

security = HTTPBearer()

#---------------------------------------------------------------------------------------------------------------------------------

def get_current_user (
        credentials : HTTPAuthorizationCredentials = Depends(security)
) :
    token = credentials.credentials

    userUuid = verify_access_token(token)

    print("User UUID from token : " , userUuid)

    if ( userUuid is None ) :
        raise HTTPException (
            status_code=401 , detail="Invalid or expired token"
        )

    user = user_collection.find_one(
        {
            "userUuid" : userUuid
        }
    )

    print("user found in database : ", user)

    if ( user is None ) :
        raise HTTPException (
            status_code=404 , detail="User Not Found"
        )

    user[ "_id" ] = str( user[ "_id" ])

    return user

#---------------------------------------------------------------------------------------------------------------------------------

# Admin-Only Dependancy

def get_current_admin(
        user : dict = Depends(get_current_user)
) :
    if ( user.get("role") != "admin" ) :
        raise HTTPException(
            status_code=403 , detail="Admin Access Required"
        )

    return user