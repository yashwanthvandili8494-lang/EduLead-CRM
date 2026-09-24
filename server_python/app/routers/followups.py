import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from ..database import get_db
from ..models import User, Lead, Followup, Activity
from ..auth import get_current_user

router = APIRouter(prefix="/api/followups", tags=["followups"])

class CreateFollowupRequest(BaseModel):
    leadId: str
    scheduledDate: str
    scheduledTime: Optional[str] = "11:00 AM"
    type: Optional[str] = "Phone Call"
    notes: Optional[str] = ""
    nextAction: Optional[str] = ""

class CompleteFollowupRequest(BaseModel):
    completionOutcome: Optional[str] = "Information Shared - Will Review"
    notes: Optional[str] = ""
    nextAction: Optional[str] = ""

@router.get("")
def get_followups(
    filter: Optional[str] = None,
    status: Optional[str] = None,
    counsellor: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Followup)

    if current_user.role == "COUNSELLOR":
        query = query.filter(Followup.counsellor_id == current_user.id)
    elif counsellor and counsellor != "ALL":
        try:
            query = query.filter(Followup.counsellor_id == int(counsellor))
        except ValueError:
            pass

    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = datetime.datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)

    if filter == "today":
        query = query.filter(
            Followup.scheduled_date >= today_start,
            Followup.scheduled_date <= today_end,
            Followup.status != "CANCELLED",
        )
    elif filter == "overdue":
        query = query.filter(
            Followup.scheduled_date < today_start,
            Followup.status == "PENDING",
        )
    elif filter == "upcoming":
        query = query.filter(
            Followup.scheduled_date > today_end,
            Followup.status == "PENDING",
        )
    elif status and status != "ALL":
        query = query.filter(Followup.status == status)

    total = query.count()
    items = query.order_by(asc(Followup.scheduled_date)).offset((page - 1) * limit).limit(limit).all()

    # Dynamic counts
    stats_q = db.query(Followup)
    if current_user.role == "COUNSELLOR":
        stats_q = stats_q.filter(Followup.counsellor_id == current_user.id)

    overdue_count = stats_q.filter(
        Followup.scheduled_date < today_start,
        Followup.status == "PENDING",
    ).count()

    today_count = stats_q.filter(
        Followup.scheduled_date >= today_start,
        Followup.scheduled_date <= today_end,
        Followup.status == "PENDING",
    ).count()

    upcoming_count = stats_q.filter(
        Followup.scheduled_date > today_end,
        Followup.status == "PENDING",
    ).count()

    return {
        "success": True,
        "data": [f.to_dict() for f in items],
        "total": total,
        "stats": {
            "overdue": overdue_count,
            "today": today_count,
            "upcoming": upcoming_count,
        },
    }

@router.post("")
def create_followup(
    req: CreateFollowupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        lead_id_int = int(req.leadId)
        lead = db.query(Lead).filter(Lead.id == lead_id_int).first()
    except ValueError:
        lead = db.query(Lead).filter(Lead.lead_id == req.leadId).first()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if current_user.role == "COUNSELLOR" and lead.assigned_counsellor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized: You are not assigned to this lead")

    # Edge Case: Prevent past dates
    try:
        target_date = datetime.datetime.fromisoformat(req.scheduledDate.replace('Z', ''))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format")

    today_midnight = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    if target_date < today_midnight:
        raise HTTPException(
            status_code=400,
            detail="Invalid schedule date: Cannot schedule a follow-up in the past. Please select today or a future date."
        )

    c_id = current_user.id if current_user.role == "COUNSELLOR" else (lead.assigned_counsellor_id or current_user.id)

    followup = Followup(
        lead_id=lead.id,
        counsellor_id=c_id,
        scheduled_date=target_date,
        scheduled_time=req.scheduledTime or "11:00 AM",
        type=req.type or "Phone Call",
        status="PENDING",
        notes=req.notes or "",
        next_action=req.nextAction or "",
    )
    db.add(followup)

    lead.next_followup_date = target_date
    if lead.status in ["NEW", "CONTACTED"]:
        lead.status = "FOLLOW_UP"

    act = Activity(
        lead_id=lead.id,
        user_id=current_user.id,
        action="FOLLOWUP_SCHEDULED",
        description=f"Follow-up ({followup.type}) scheduled for {target_date.strftime('%d-%m-%Y')} by {current_user.name}",
    )
    db.add(act)
    db.commit()
    db.refresh(followup)

    return {
        "success": True,
        "message": "Follow-up scheduled successfully",
        "data": followup.to_dict(),
    }

@router.patch("/{id}/complete")
def complete_followup(
    id: str,
    req: CompleteFollowupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    followup = db.query(Followup).filter(Followup.id == int(id)).first()
    if not followup:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    followup.status = "COMPLETED"
    followup.completed_at = datetime.datetime.utcnow()
    followup.completion_outcome = req.completionOutcome or "Positive - Likely to Apply"
    if req.notes:
        followup.notes = f"{followup.notes}\n[Completed]: {req.notes}".strip()
    if req.nextAction:
        followup.next_action = req.nextAction

    lead = db.query(Lead).filter(Lead.id == followup.lead_id).first()
    if lead:
        lead.last_contact_date = datetime.datetime.utcnow()
        lead.next_followup_date = None
        act = Activity(
            lead_id=lead.id,
            user_id=current_user.id,
            action="FOLLOWUP_COMPLETED",
            description=f"Follow-up completed by {current_user.name}. Outcome: {followup.completion_outcome}",
        )
        db.add(act)

    db.commit()
    db.refresh(followup)

    return {
        "success": True,
        "message": "Follow-up marked as completed",
        "data": followup.to_dict(),
    }
