import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Lead, Followup
from ..auth import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/dashboard")
def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    is_counsellor = (current_user.role == "COUNSELLOR")

    lead_q = db.query(Lead)
    if is_counsellor:
        lead_q = lead_q.filter(Lead.assigned_counsellor_id == current_user.id)

    total_leads = lead_q.count()
    new_leads = lead_q.filter(Lead.status == "NEW").count()
    converted_leads = lead_q.filter(Lead.status == "CONVERTED").count()
    lost_leads = lead_q.filter(Lead.status == "LOST").count()

    followup_q = db.query(Followup)
    if is_counsellor:
        followup_q = followup_q.filter(Followup.counsellor_id == current_user.id)

    total_followups = followup_q.filter(Followup.status == "PENDING").count()

    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    overdue_followups = followup_q.filter(
        Followup.scheduled_date < today_start,
        Followup.status == "PENDING",
    ).count()

    # Pipeline
    pipeline_stages = ["NEW", "CONTACTED", "FOLLOW_UP", "INTERESTED", "APPLICATION", "CONVERTED"]
    pipeline_data = []
    for stage in pipeline_stages:
        cnt = lead_q.filter(Lead.status == stage).count()
        pipeline_data.append({"stage": stage, "count": cnt})

    # Sources
    sources = ["Website", "Walk-in", "Phone", "WhatsApp", "Fair", "Campaign", "Other"]
    source_data = []
    for s in sources:
        t = lead_q.filter(Lead.source == s).count()
        c = lead_q.filter(Lead.source == s, Lead.status == "CONVERTED").count()
        source_data.append({
            "source": s,
            "total": t,
            "converted": c,
            "conversionRate": round((c / t) * 100) if t > 0 else 0,
        })

    # Ageing
    now = datetime.datetime.utcnow()
    two_days_ago = now - datetime.timedelta(days=2)
    seven_days_ago = now - datetime.timedelta(days=7)
    fifteen_days_ago = now - datetime.timedelta(days=15)

    active_q = lead_q.filter(Lead.status.notin_(["CONVERTED", "LOST"]))
    age_0_2 = active_q.filter(Lead.created_at >= two_days_ago).count()
    age_3_7 = active_q.filter(Lead.created_at >= seven_days_ago, Lead.created_at < two_days_ago).count()
    age_8_15 = active_q.filter(Lead.created_at >= fifteen_days_ago, Lead.created_at < seven_days_ago).count()
    age_15_plus = active_q.filter(Lead.created_at < fifteen_days_ago).count()

    recent_leads = lead_q.order_by(Lead.created_at.desc()).limit(6).all()

    conv_rate_str = f"{(converted_leads / total_leads * 100):.1f}" if total_leads > 0 else "0"

    return {
        "success": True,
        "data": {
            "metrics": {
                "totalLeads": total_leads,
                "newLeads": new_leads,
                "followups": total_followups,
                "converted": converted_leads,
                "lost": lost_leads,
                "overdue": overdue_followups,
                "conversionRate": conv_rate_str,
            },
            "pipeline": pipeline_data,
            "sources": source_data,
            "ageing": [
                {"range": "0–2 days", "label": "Fresh", "count": age_0_2, "color": "#10b981"},
                {"range": "3–7 days", "label": "Active", "count": age_3_7, "color": "#3b82f6"},
                {"range": "8–15 days", "label": "At Risk", "count": age_8_15, "color": "#f59e0b"},
                {"range": "15+ days", "label": "Stagnant", "count": age_15_plus, "color": "#ef4444"},
            ],
            "recentLeads": [l.to_dict() for l in recent_leads],
        },
    }

@router.get("/analytics")
def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1. Source Performance
    sources = ["Website", "Walk-in", "Phone", "WhatsApp", "Fair", "Campaign", "Other"]
    source_report = []
    for s in sources:
        total = db.query(Lead).filter(Lead.source == s).count()
        converted = db.query(Lead).filter(Lead.source == s, Lead.status == "CONVERTED").count()
        lost = db.query(Lead).filter(Lead.source == s, Lead.status == "LOST").count()
        in_prog = total - converted - lost
        rate = round((converted / total) * 100) if total > 0 else 0
        source_report.append({
            "source": s,
            "total": total,
            "converted": converted,
            "lost": lost,
            "inProgress": in_prog,
            "conversionRate": rate,
        })

    # 2. Counsellor Performance
    counsellors = db.query(User).filter(User.role.in_(["COUNSELLOR", "MANAGER"])).all()
    counsellor_report = []
    for c in counsellors:
        tot = db.query(Lead).filter(Lead.assigned_counsellor_id == c.id).count()
        conv = db.query(Lead).filter(Lead.assigned_counsellor_id == c.id, Lead.status == "CONVERTED").count()
        lst = db.query(Lead).filter(Lead.assigned_counsellor_id == c.id, Lead.status == "LOST").count()
        pend = db.query(Followup).filter(Followup.counsellor_id == c.id, Followup.status == "PENDING").count()
        comp = db.query(Followup).filter(Followup.counsellor_id == c.id, Followup.status == "COMPLETED").count()
        rate = round((conv / tot) * 100) if tot > 0 else 0

        counsellor_report.append({
            "id": str(c.id),
            "name": c.name,
            "email": c.email,
            "totalAssigned": tot,
            "converted": conv,
            "lost": lst,
            "pendingFollowups": pend,
            "completedFollowups": comp,
            "conversionRate": rate,
        })

    unassigned_count = db.query(Lead).filter(Lead.assigned_counsellor_id == None).count()

    # 3. Status Distribution Funnel
    all_statuses = ["NEW", "CONTACTED", "FOLLOW_UP", "INTERESTED", "APPLICATION", "CONVERTED", "LOST"]
    tot_all = db.query(Lead).count()
    status_distribution = []
    for st in all_statuses:
        cnt = db.query(Lead).filter(Lead.status == st).count()
        pct = round((cnt / tot_all) * 100) if tot_all > 0 else 0
        status_distribution.append({
            "status": st,
            "count": cnt,
            "percentage": pct,
        })

    # 4. Ageing Report
    active_leads = db.query(Lead).filter(Lead.status.notin_(["CONVERTED", "LOST"])).order_by(Lead.created_at.asc()).limit(50).all()
    now = datetime.datetime.utcnow()

    ageing_list = []
    for l in active_leads:
        age_days = (now - l.created_at).days if l.created_at else 0
        last_c_days = (now - l.last_contact_date).days if l.last_contact_date else age_days

        risk = "Normal"
        if age_days >= 15 or last_c_days >= 7:
            risk = "Critical"
        elif age_days >= 8 or last_c_days >= 4:
            risk = "Warning"

        ageing_list.append({
            "_id": str(l.id),
            "leadId": l.lead_id,
            "studentName": l.student_name,
            "phone": l.phone,
            "coursePreference": l.course_preference,
            "source": l.source,
            "status": l.status,
            "counsellorName": l.counsellor.name if l.counsellor else "Unassigned",
            "ageDays": age_days,
            "lastContactDays": last_c_days,
            "riskCategory": risk,
        })

    return {
        "success": True,
        "data": {
            "sourcePerformance": source_report,
            "counsellorPerformance": counsellor_report,
            "unassignedCount": unassigned_count,
            "statusDistribution": status_distribution,
            "ageingReport": ageing_list,
        },
    }
