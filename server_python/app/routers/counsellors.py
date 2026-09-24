from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Lead
from ..auth import get_current_user, require_roles, get_password_hash

router = APIRouter(prefix="/api/users", tags=["users"])

class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: Optional[str] = "Welcome@123"
    role: Optional[str] = "COUNSELLOR"
    phone: Optional[str] = ""
    department: Optional[str] = "Admissions"
    specialization: Optional[str] = "General"

@router.get("/counsellors")
def get_counsellors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    users = db.query(User).filter(User.role.in_(["COUNSELLOR", "MANAGER"])).all()
    results = []

    for u in users:
        total_assigned = db.query(Lead).filter(Lead.assigned_counsellor_id == u.id).count()
        active_leads = db.query(Lead).filter(
            Lead.assigned_counsellor_id == u.id,
            Lead.status.notin_(["CONVERTED", "LOST"]),
        ).count()
        converted_leads = db.query(Lead).filter(
            Lead.assigned_counsellor_id == u.id,
            Lead.status == "CONVERTED",
        ).count()
        lost_leads = db.query(Lead).filter(
            Lead.assigned_counsellor_id == u.id,
            Lead.status == "LOST",
        ).count()

        conv_rate = round((converted_leads / total_assigned) * 100) if total_assigned > 0 else 0

        d = u.to_dict()
        d.update({
            "totalAssigned": total_assigned,
            "activeLeads": active_leads,
            "convertedLeads": converted_leads,
            "lostLeads": lost_leads,
            "conversionRate": conv_rate,
        })
        results.append(d)

    return {"success": True, "data": results}

@router.patch("/{id}/toggle-status")
def toggle_status(
    id: str,
    current_user: User = Depends(require_roles("ADMIN", "MANAGER")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == int(id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()

    active_leads_count = db.query(Lead).filter(
        Lead.assigned_counsellor_id == user.id,
        Lead.status.notin_(["CONVERTED", "LOST"]),
    ).count()

    return {
        "success": True,
        "message": f"User {user.name} is now {'Active' if user.is_active else 'Deactivated'}",
        "data": user.to_dict(),
        "activeLeadsToReassign": active_leads_count if not user.is_active else 0,
    }

@router.post("")
def create_user(
    req: CreateUserRequest,
    current_user: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = User(
        name=req.name.strip(),
        email=req.email.strip().lower(),
        password_hash=get_password_hash(req.password or "Welcome@123"),
        role=req.role or "COUNSELLOR",
        phone=req.phone or "",
        department=req.department or "Admissions",
        specialization=req.specialization or "General",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "User created successfully",
        "data": new_user.to_dict(),
    }
