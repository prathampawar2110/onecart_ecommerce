# this is used for admin here we check who login in on website

from fastapi import HTTPException

def require_admin ( user ):

    if (user ["role"] != "admin") :
        raise HTTPException (
            status_code=403 , 
            detail= "Admin Access Required"
        )
    return user