from firebase_admin import auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer

auth_scheme = HTTPBearer()

def authenticate_user(token: str = Depends(auth_scheme)):
    try:
        decoded_token = auth.verify_id_token(token.credentials, check_revoked=True)
        return decoded_token['uid']
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid, log in again",
        )
