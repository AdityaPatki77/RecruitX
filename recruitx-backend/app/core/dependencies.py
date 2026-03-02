from fastapi import Depends, HTTPException
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        payload["sub"] = int(payload["sub"])  # 👈 CONVERT BACK

        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")



def student_only(user=Depends(get_current_user)):
    if user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")
    return user


def placement_only(user=Depends(get_current_user)):
    if user["role"] != "placement":
        raise HTTPException(status_code=403, detail="Placement team only")
    return user