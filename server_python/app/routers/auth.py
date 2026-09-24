from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..auth import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact admissions administration."
        )

    token = create_access_token(user.id)
    return {
        "success": True,
        "token": token,
        "user": user.to_dict(),
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "user": current_user.to_dict(),
    }

@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_active == True).all()
    demo_list = []
    for u in users:
        demo_list.append({
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "token": create_access_token(u.id),
        })
    return {
        "success": True,
        "data": demo_list,
    }
