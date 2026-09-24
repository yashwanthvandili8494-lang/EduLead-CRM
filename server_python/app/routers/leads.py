import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from ..database import get_db
from ..models import User, Lead, Followup, Activity, RecoveryHistory
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/leads", tags=["leads"])

class CheckDuplicateRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None

class CreateLeadRequest(BaseModel):
    studentName: str
    phone: str
    email: str
    coursePreference: Optional[str] = "BCA"
    source: Optional[str] = "Website"
    priority: Optional[str] = "MEDIUM"
    assignedCounsellor: Optional[str] = None
    city: Optional[str] = ""
    previousEducation: Optional[str] = ""
    percentage: Optional[str] = ""
    notes: Optional[str] = ""
    allowDuplicate: Optional[bool] = False

class UpdateLeadRequest(BaseModel):
    studentName: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    coursePreference: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    city: Optional[str] = None
    previousEducation: Optional[str] = None
    percentage: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    status: str
    conversionDetails: Optional[Dict[str, Any]] = None
    lostReason: Optional[str] = None
    lostNotes: Optional[str] = None

class RecoverLeadRequest(BaseModel):
    recoveryReason: Optional[str] = "Student re-engaged"
    targetStatus: Optional[str] = "FOLLOW_UP"

class AssignCounsellorRequest(BaseModel):
    counsellorId: Optional[str] = None

class BulkReassignRequest(BaseModel):
    toCounsellorId: str
    fromCounsellorId: Optional[str] = None
    leadIds: Optional[List[str]] = None

@router.get("")
def get_leads(
    status: Optional[str] = None,
    source: Optional[str] = None,
    course: Optional[str] = None,
    counsellor: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    ageing: Optional[str] = None,
    unassigned: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    sortBy: str = "createdAt",
    sortOrder: str = "desc",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Lead)

    # Counsellor privacy restriction
    if current_user.role == "COUNSELLOR":
        query = query.filter(Lead.assigned_counsellor_id == current_user.id)
    elif counsellor and counsellor != "ALL":
        if counsellor == "unassigned":
            query = query.filter(Lead.assigned_counsellor_id == None)
        else:
            try:
                query = query.filter(Lead.assigned_counsellor_id == int(counsellor))
            except ValueError:
                pass

    if unassigned == "true":
        query = query.filter(Lead.assigned_counsellor_id == None)

    if status and status != "ALL":
        query = query.filter(Lead.status == status)

    if source and source != "ALL":
        query = query.filter(Lead.source == source)

    if course and course != "ALL":
        query = query.filter(Lead.course_preference == course)

    if priority and priority != "ALL":
        query = query.filter(Lead.priority == priority)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Lead.student_name.ilike(s),
                Lead.phone.ilike(s),
                Lead.email.ilike(s),
                Lead.lead_id.ilike(s),
            )
        )

    # Ageing filter
    now = datetime.datetime.utcnow()
    if ageing == "0-2":
        query = query.filter(Lead.created_at >= now - datetime.timedelta(days=2))
    elif ageing == "3-7":
        query = query.filter(
            Lead.created_at >= now - datetime.timedelta(days=7),
            Lead.created_at < now - datetime.timedelta(days=2),
        )
    elif ageing == "8-15":
        query = query.filter(
            Lead.created_at >= now - datetime.timedelta(days=15),
            Lead.created_at < now - datetime.timedelta(days=7),
        )
    elif ageing == "15+":
        query = query.filter(Lead.created_at < now - datetime.timedelta(days=15))

    total_leads = query.count()

    order_col = Lead.created_at
    if sortBy == "studentName":
        order_col = Lead.student_name
    elif sortBy == "status":
        order_col = Lead.status

    if sortOrder == "asc":
        query = query.order_by(asc(order_col))
    else:
        query = query.order_by(desc(order_col))

    leads = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "success": True,
        "count": len(leads),
        "totalLeads": total_leads,
        "totalPages": (total_leads + limit - 1) // limit,
        "currentPage": page,
        "data": [l.to_dict() for l in leads],
    }

@router.post("/check-duplicate")
def check_duplicate(req: CheckDuplicateRequest, db: Session = Depends(get_db)):
    matches = []
    if req.phone:
        p_matches = db.query(Lead).filter(Lead.phone == req.phone.strip()).all()
        for m in p_matches:
            matches.append({
                "matchType": "PHONE",
                "lead": m.to_dict(),
            })

    if req.email:
        e_matches = db.query(Lead).filter(Lead.email == req.email.strip().lower()).all()
        for m in e_matches:
            if not any(x["lead"]["id"] == str(m.id) for x in matches):
                matches.append({
                    "matchType": "EMAIL",
                    "lead": m.to_dict(),
                })

    return {
        "success": True,
        "hasDuplicates": len(matches) > 0,
        "matches": matches,
    }

@router.post("")
def create_lead(
    req: CreateLeadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check duplicate
    dup_phone = db.query(Lead).filter(Lead.phone == req.phone.strip()).all()
    dup_email = db.query(Lead).filter(Lead.email == req.email.strip().lower()).all()

    duplicate_matches = []
    for d in dup_phone:
        duplicate_matches.append({"leadId": d.lead_id, "matchType": "PHONE", "source": d.source})
    for d in dup_email:
        if not any(x["leadId"] == d.lead_id for x in duplicate_matches):
            duplicate_matches.append({"leadId": d.lead_id, "matchType": "EMAIL", "source": d.source})

    if duplicate_matches and not req.allowDuplicate:
        raise HTTPException(
            status_code=409,
            detail={
                "success": False,
                "isDuplicate": True,
                "message": f"Potential duplicate lead detected! Contact already exists.",
                "duplicateMatches": duplicate_matches,
            }
        )

    count = db.query(Lead).count()
    lead_id = f"LED-{datetime.datetime.utcnow().year}-{count + 1001:04d}"

    counsellor_id = None
    if req.assignedCounsellor:
        try:
            counsellor_id = int(req.assignedCounsellor)
        except ValueError:
            pass
    elif current_user.role == "COUNSELLOR":
        counsellor_id = current_user.id

    new_lead = Lead(
        lead_id=lead_id,
        student_name=req.studentName.strip(),
        phone=req.phone.strip(),
        email=req.email.strip().lower(),
        course_preference=req.coursePreference or "BCA",
        source=req.source or "Website",
        status="NEW",
        priority=req.priority or "MEDIUM",
        assigned_counsellor_id=counsellor_id,
        city=req.city or "",
        previous_education=req.previousEducation or "",
        percentage=req.percentage or "",
        notes=req.notes or "",
        duplicate_flag=bool(duplicate_matches),
    )
    db.add(new_lead)
    db.flush()

    # Create Activity
    act = Activity(
        lead_id=new_lead.id,
        user_id=current_user.id,
        action="LEAD_CREATED",
        description=f"Lead created from source '{new_lead.source}' by {current_user.name}",
    )
    db.add(act)

    if counsellor_id:
        c_user = db.query(User).filter(User.id == counsellor_id).first()
        act2 = Activity(
            lead_id=new_lead.id,
            user_id=current_user.id,
            action="COUNSELLOR_ASSIGNED",
            description=f"Assigned to counsellor {c_user.name if c_user else 'Staff'}",
        )
        db.add(act2)

    db.commit()
    db.refresh(new_lead)

    return {
        "success": True,
        "message": "Lead created successfully",
        "data": new_lead.to_dict(),
    }

@router.post("/bulk-reassign")
def bulk_reassign(
    req: BulkReassignRequest,
    current_user: User = Depends(require_roles("ADMIN", "MANAGER")),
    db: Session = Depends(get_db)
):
    try:
        to_id = int(req.toCounsellorId)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid target counsellor ID")

    target_user = db.query(User).filter(User.id == to_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target counsellor not found")

    query = db.query(Lead)
    if req.leadIds:
        ids = []
        for i in req.leadIds:
            try:
                ids.append(int(i))
            except ValueError:
                pass
        query = query.filter(Lead.id.in_(ids))
    elif req.fromCounsellorId:
        from_id = int(req.fromCounsellorId)
        query = query.filter(
            Lead.assigned_counsellor_id == from_id,
            Lead.status.notin_(["CONVERTED", "LOST"]),
        )
    else:
        # Reassign all unassigned
        query = query.filter(
            Lead.assigned_counsellor_id == None,
            Lead.status.notin_(["CONVERTED", "LOST"]),
        )

    leads_to_update = query.all()
    for l in leads_to_update:
        l.assigned_counsellor_id = to_id
        l.last_contact_date = datetime.datetime.utcnow()
        act = Activity(
            lead_id=l.id,
            user_id=current_user.id,
            action="COUNSELLOR_REASSIGNED",
            description=f"Bulk reassigned to counsellor {target_user.name} by {current_user.name}",
        )
        db.add(act)

    db.commit()

    return {
        "success": True,
        "message": f"Successfully reassigned {len(leads_to_update)} leads to {target_user.name}",
        "count": len(leads_to_update),
    }

@router.get("/{id}")
def get_lead_by_id(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        lead_id_int = int(id)
        lead = db.query(Lead).filter(Lead.id == lead_id_int).first()
    except ValueError:
        lead = db.query(Lead).filter(Lead.lead_id == id).first()

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Privacy check for counsellors
    if current_user.role == "COUNSELLOR" and lead.assigned_counsellor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied: You are only authorized to view your assigned admission leads."
        )

    followups = [f.to_dict() for f in lead.followups]
    activities = [a.to_dict() for a in lead.activities]

    lead_data = lead.to_dict()
    lead_data["followups"] = followups
    lead_data["activities"] = activities

    return {
        "success": True,
        "data": lead_data,
    }

@router.put("/{id}")
def update_lead(
    id: str,
    req: UpdateLeadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(Lead.id == int(id)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if current_user.role == "COUNSELLOR" and lead.assigned_counsellor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to edit this lead")

    if req.studentName is not None: lead.student_name = req.studentName
    if req.phone is not None: lead.phone = req.phone
    if req.email is not None: lead.email = req.email
    if req.coursePreference is not None: lead.course_preference = req.coursePreference
    if req.priority is not None: lead.priority = req.priority
    if req.notes is not None: lead.notes = req.notes
    if req.city is not None: lead.city = req.city
    if req.previousEducation is not None: lead.previous_education = req.previousEducation
    if req.percentage is not None: lead.percentage = req.percentage

    lead.last_contact_date = datetime.datetime.utcnow()

    act = Activity(
        lead_id=lead.id,
        user_id=current_user.id,
        action="LEAD_UPDATED",
        description=f"Lead details updated by {current_user.name}",
    )
    db.add(act)
    db.commit()

    return {"success": True, "message": "Lead updated", "data": lead.to_dict()}

@router.patch("/{id}/status")
def update_lead_status(
    id: str,
    req: StatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(Lead.id == int(id)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if current_user.role == "COUNSELLOR" and lead.assigned_counsellor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to change this lead status")

    previous_status = lead.status

    # Edge Case: CONVERTED requires mandatory admission details
    if req.status == "CONVERTED":
        details = req.conversionDetails
        if not details or not details.get("admissionId") or not details.get("feePaid"):
            raise HTTPException(
                status_code=400,
                detail="Conversion validation failed: Admission ID and initial Fee Paid amount are required to mark a lead as CONVERTED."
            )
        lead.admission_id = str(details.get("admissionId")).strip()
        lead.fee_paid = float(details.get("feePaid"))
        lead.receipt_number = str(details.get("receiptNumber", f"REC-{int(datetime.datetime.utcnow().timestamp())}"))
        lead.enrolled_at = datetime.datetime.utcnow()
        lead.conversion_remarks = details.get("remarks", "Admission confirmed")
        lead.lost_reason = None

    # Edge Case: LOST requires mandatory reason
    if req.status == "LOST":
        if not req.lostReason:
            raise HTTPException(
                status_code=400,
                detail="Lost validation failed: A valid reason is required to mark a lead as LOST."
            )
        lead.lost_reason = req.lostReason
        lead.lost_notes = req.lostNotes or ""
        lead.lost_at = datetime.datetime.utcnow()

    lead.status = req.status
    lead.last_contact_date = datetime.datetime.utcnow()

    action = "STATUS_CHANGED"
    desc = f"Status changed from {previous_status} to {req.status} by {current_user.name}"
    if req.status == "CONVERTED":
        action = "LEAD_CONVERTED"
        desc = f"Student enrolled! Admission ID: {lead.admission_id}, Fee: ₹{lead.fee_paid}"
    elif req.status == "LOST":
        action = "LEAD_LOST"
        desc = f"Lead marked LOST by {current_user.name}. Reason: {lead.lost_reason}"

    act = Activity(
        lead_id=lead.id,
        user_id=current_user.id,
        action=action,
        description=desc,
    )
    db.add(act)
    db.commit()

    return {"success": True, "message": f"Status updated to {req.status}", "data": lead.to_dict()}

@router.post("/{id}/recover")
def recover_lead(
    id: str,
    req: RecoverLeadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(Lead.id == int(id)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if lead.status != "LOST":
        raise HTTPException(status_code=400, detail="Lead is not marked as lost")

    rec = RecoveryHistory(
        lead_id=lead.id,
        recovered_by_id=current_user.id,
        reason=req.recoveryReason or "Student re-engaged",
    )
    db.add(rec)

    prev_reason = lead.lost_reason
    target_status = req.targetStatus or "FOLLOW_UP"
    lead.status = target_status
    lead.lost_reason = None
    lead.lost_at = None
    lead.last_contact_date = datetime.datetime.utcnow()

    act = Activity(
        lead_id=lead.id,
        user_id=current_user.id,
        action="LEAD_RECOVERED",
        description=f"Lead recovered from LOST to {target_status} by {current_user.name}. Reason: {req.recoveryReason}",
    )
    db.add(act)
    db.commit()

    return {"success": True, "message": "Lead recovered successfully", "data": lead.to_dict()}

@router.patch("/{id}/assign")
def assign_counsellor(
    id: str,
    req: AssignCounsellorRequest,
    current_user: User = Depends(require_roles("ADMIN", "MANAGER")),
    db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(Lead.id == int(id)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    c_id = int(req.counsellorId) if req.counsellorId else None
    new_c = db.query(User).filter(User.id == c_id).first() if c_id else None

    lead.assigned_counsellor_id = c_id
    act = Activity(
        lead_id=lead.id,
        user_id=current_user.id,
        action="COUNSELLOR_ASSIGNED",
        description=f"Lead assigned to {new_c.name if new_c else 'Unassigned Pool'} by {current_user.name}",
    )
    db.add(act)
    db.commit()

    return {"success": True, "message": "Counsellor assigned", "data": lead.to_dict()}
