import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Float,
    Text,
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="COUNSELLOR") # ADMIN, MANAGER, COUNSELLOR
    phone = Column(String(50), nullable=True)
    department = Column(String(100), default="Admissions & Outreach")
    is_active = Column(Boolean, default=True)
    specialization = Column(String(200), default="General")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    assigned_leads = relationship("Lead", back_populates="counsellor", foreign_keys="Lead.assigned_counsellor_id")
    followups = relationship("Followup", back_populates="counsellor", foreign_keys="Followup.counsellor_id")
    activities = relationship("Activity", back_populates="user", foreign_keys="Activity.user_id")

    def to_dict(self):
        return {
            "_id": str(self.id),
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "phone": self.phone,
            "department": self.department,
            "isActive": self.is_active,
            "specialization": [s.strip() for s in self.specialization.split(",")] if self.specialization else ["General"],
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(String(50), unique=True, index=True, nullable=False)
    student_name = Column(String(100), nullable=False, index=True)
    phone = Column(String(50), nullable=False, index=True)
    email = Column(String(100), nullable=False, index=True)
    course_preference = Column(String(50), default="BCA")
    source = Column(String(50), default="Website")
    status = Column(String(20), default="NEW", index=True)
    priority = Column(String(20), default="MEDIUM")
    assigned_counsellor_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    expected_admission_date = Column(DateTime, nullable=True)
    last_contact_date = Column(DateTime, default=datetime.datetime.utcnow)
    next_followup_date = Column(DateTime, nullable=True)
    notes = Column(Text, default="")
    city = Column(String(100), default="")
    previous_education = Column(String(100), default="")
    percentage = Column(String(20), default="")

    # Conversion Details
    admission_id = Column(String(50), nullable=True)
    fee_paid = Column(Float, nullable=True)
    receipt_number = Column(String(50), nullable=True)
    enrolled_at = Column(DateTime, nullable=True)
    conversion_remarks = Column(Text, nullable=True)

    # Lost Details
    lost_reason = Column(String(100), nullable=True)
    lost_notes = Column(Text, nullable=True)
    lost_at = Column(DateTime, nullable=True)

    # Edge cases
    duplicate_flag = Column(Boolean, default=False)
    duplicate_matches_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    counsellor = relationship("User", back_populates="assigned_leads", foreign_keys=[assigned_counsellor_id])
    followups = relationship("Followup", back_populates="lead", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="lead", cascade="all, delete-orphan")
    recovery_history = relationship("RecoveryHistory", back_populates="lead", cascade="all, delete-orphan")

    @property
    def age_in_days(self):
        if not self.created_at:
            return 0
        diff = datetime.datetime.utcnow() - self.created_at
        return max(0, diff.days)

    def to_dict(self):
        conversion_details = None
        if self.status == "CONVERTED" or self.admission_id:
            conversion_details = {
                "admissionId": self.admission_id,
                "feePaid": self.fee_paid,
                "receiptNumber": self.receipt_number,
                "enrolledAt": self.enrolled_at.isoformat() if self.enrolled_at else None,
                "remarks": self.conversion_remarks,
            }

        return {
            "_id": str(self.id),
            "id": str(self.id),
            "leadId": self.lead_id,
            "studentName": self.student_name,
            "phone": self.phone,
            "email": self.email,
            "coursePreference": self.course_preference,
            "source": self.source,
            "status": self.status,
            "priority": self.priority,
            "assignedCounsellor": self.counsellor.to_dict() if self.counsellor else None,
            "expectedAdmissionDate": self.expected_admission_date.isoformat() if self.expected_admission_date else None,
            "lastContactDate": self.last_contact_date.isoformat() if self.last_contact_date else None,
            "nextFollowupDate": self.next_followup_date.isoformat() if self.next_followup_date else None,
            "notes": self.notes or "",
            "city": self.city or "",
            "previousEducation": self.previous_education or "",
            "percentage": self.percentage or "",
            "conversionDetails": conversion_details,
            "lostReason": self.lost_reason,
            "lostNotes": self.lost_notes,
            "lostAt": self.lost_at.isoformat() if self.lost_at else None,
            "duplicateFlag": bool(self.duplicate_flag),
            "ageInDays": self.age_in_days,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }

class Followup(Base):
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)
    counsellor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    scheduled_date = Column(DateTime, nullable=False, index=True)
    scheduled_time = Column(String(50), default="11:00 AM")
    type = Column(String(50), default="Phone Call")
    status = Column(String(20), default="PENDING", index=True)
    notes = Column(Text, default="")
    next_action = Column(String(255), default="")
    completed_at = Column(DateTime, nullable=True)
    completion_outcome = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    lead = relationship("Lead", back_populates="followups")
    counsellor = relationship("User", back_populates="followups")

    def to_dict(self):
        return {
            "_id": str(self.id),
            "id": str(self.id),
            "leadId": {
                "_id": str(self.lead.id),
                "id": str(self.lead.id),
                "leadId": self.lead.lead_id,
                "studentName": self.lead.student_name,
                "phone": self.lead.phone,
                "email": self.lead.email,
                "coursePreference": self.lead.course_preference,
                "status": self.lead.status,
                "priority": self.lead.priority,
            } if self.lead else None,
            "counsellorId": {
                "_id": str(self.counsellor.id),
                "id": str(self.counsellor.id),
                "name": self.counsellor.name,
                "email": self.counsellor.email,
            } if self.counsellor else None,
            "scheduledDate": self.scheduled_date.isoformat() if self.scheduled_date else None,
            "scheduledTime": self.scheduled_time,
            "type": self.type,
            "status": self.status,
            "notes": self.notes,
            "nextAction": self.next_action,
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
            "completionOutcome": self.completion_outcome,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    # Relationships
    lead = relationship("Lead", back_populates="activities")
    user = relationship("User", back_populates="activities")

    def to_dict(self):
        return {
            "_id": str(self.id),
            "id": str(self.id),
            "leadId": str(self.lead_id),
            "userId": {
                "_id": str(self.user.id),
                "id": str(self.user.id),
                "name": self.user.name,
                "role": self.user.role,
            } if self.user else None,
            "action": self.action,
            "description": self.description,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }

class RecoveryHistory(Base):
    __tablename__ = "recovery_histories"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    recovered_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    recovered_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    lead = relationship("Lead", back_populates="recovery_history")
    recovered_by = relationship("User")
