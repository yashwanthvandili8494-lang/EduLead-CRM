import datetime
from sqlalchemy.orm import Session
from .models import User, Lead, Followup, Activity
from .auth import get_password_hash

def seed_database(db: Session):
    existing_users = db.query(User).count()
    if existing_users > 0:
        return

    print("[Python Seed] Seeding realistic EduLead SQL database...")

    # 1. Users
    admin = User(
        name="Dr. Suresh Sharma",
        email="admin@edulead.edu",
        password_hash=get_password_hash("Admin@123"),
        role="ADMIN",
        phone="+91 98201 11223",
        department="Dean of Admissions",
        specialization="Strategy, Institutional Policy",
    )
    manager = User(
        name="Ananya Deshmukh",
        email="manager@edulead.edu",
        password_hash=get_password_hash("Manager@123"),
        role="MANAGER",
        phone="+91 98202 22334",
        department="Admissions Operations",
        specialization="Lead Operations, Conversion Analytics",
    )
    priya = User(
        name="Priya Nair",
        email="priya@edulead.edu",
        password_hash=get_password_hash("Priya@123"),
        role="COUNSELLOR",
        phone="+91 98203 33445",
        department="UG Admissions",
        specialization="BCA, BBA, B.Com",
    )
    rohan = User(
        name="Rohan Verma",
        email="rohan@edulead.edu",
        password_hash=get_password_hash("Rohan@123"),
        role="COUNSELLOR",
        phone="+91 98204 44556",
        department="Engineering Admissions",
        specialization="B.Tech CSE, B.Tech AI, MCA",
    )
    neha = User(
        name="Neha Kulkarni",
        email="neha@edulead.edu",
        password_hash=get_password_hash("Neha@123"),
        role="COUNSELLOR",
        phone="+91 98205 55667",
        department="PG & Management Admissions",
        specialization="MBA, MCA",
    )

    db.add_all([admin, manager, priya, rohan, neha])
    db.commit()

    now = datetime.datetime.utcnow()
    def days_ago(d):
        return now - datetime.timedelta(days=d)
    def days_ahead(d):
        return now + datetime.timedelta(days=d)

    # 2. Leads Data
    leads_data = [
        {
            "lead_id": "LED-2026-1001",
            "student_name": "Rahul Kumar",
            "phone": "+91 98450 12345",
            "email": "rahul.kumar@gmail.com",
            "course_preference": "BCA",
            "source": "WhatsApp",
            "status": "INTERESTED",
            "priority": "HIGH",
            "counsellor_id": priya.id,
            "city": "Bangalore",
            "previous_education": "12th Science (State Board)",
            "percentage": "84.5%",
            "created_days": 4,
            "notes": "Interested in BCA with Cloud Specialization. Asked about hostel and installment facility.",
        },
        {
            "lead_id": "LED-2026-1002",
            "student_name": "Anita Rao",
            "phone": "+91 98450 23456",
            "email": "anita.rao@outlook.com",
            "course_preference": "B.Tech CSE",
            "source": "Website",
            "status": "APPLICATION",
            "priority": "URGENT",
            "counsellor_id": rohan.id,
            "city": "Hyderabad",
            "previous_education": "12th CBSE",
            "percentage": "91.2%",
            "created_days": 8,
            "notes": "Application form submitted online. Verification of 12th marksheet in progress.",
        },
        {
            "lead_id": "LED-2026-1003",
            "student_name": "Vikram Malhotra",
            "phone": "+91 98450 34567",
            "email": "vikram.m@gmail.com",
            "course_preference": "MBA",
            "source": "Walk-in",
            "status": "CONVERTED",
            "priority": "HIGH",
            "counsellor_id": neha.id,
            "city": "Mumbai",
            "previous_education": "B.Com (Hons)",
            "percentage": "78.0%",
            "created_days": 14,
            "notes": "Admitted into MBA Finance. Scholarship fee waiver approved.",
            "admission_id": "ADM-2026-MBA-089",
            "fee_paid": 75000.0,
            "receipt_number": "REC-2026-4491",
            "enrolled_at": days_ago(2),
            "conversion_remarks": "First installment paid online via NEFT. ID card issued.",
        },
        {
            "lead_id": "LED-2026-1004",
            "student_name": "Sneha Patel",
            "phone": "+91 98450 45678",
            "email": "sneha.patel@yahoo.com",
            "course_preference": "B.Tech AI",
            "source": "Fair",
            "status": "FOLLOW_UP",
            "priority": "MEDIUM",
            "counsellor_id": rohan.id,
            "city": "Ahmedabad",
            "previous_education": "12th GSEB",
            "percentage": "86.4%",
            "created_days": 6,
            "notes": "Met at Education Expo. Requested syllabus comparison with traditional CSE.",
        },
        {
            "lead_id": "LED-2026-1005",
            "student_name": "Kiran Joshi",
            "phone": "+91 98450 56789",
            "email": "kiran.joshi@gmail.com",
            "course_preference": "BBA",
            "source": "Phone",
            "status": "NEW",
            "priority": "MEDIUM",
            "counsellor_id": None, # Unassigned pool
            "city": "Pune",
            "previous_education": "12th Commerce",
            "percentage": "76.2%",
            "created_days": 1,
            "notes": "Inquired about fee structure and sports quota eligibility.",
        },
        {
            "lead_id": "LED-2026-1006",
            "student_name": "Amit Verma",
            "phone": "+91 98450 67890",
            "email": "amit.verma@hotmail.com",
            "course_preference": "MCA",
            "source": "Campaign",
            "status": "CONTACTED",
            "priority": "LOW",
            "counsellor_id": priya.id,
            "city": "Delhi NCR",
            "previous_education": "B.Sc Computer Science",
            "percentage": "72.0%",
            "created_days": 3,
            "notes": "Working professional looking for evening/weekend options. Clarified regular attendance criteria.",
        },
        {
            "lead_id": "LED-2026-1007",
            "student_name": "Pooja Gupta",
            "phone": "+91 98450 78901",
            "email": "pooja.gupta@gmail.com",
            "course_preference": "BCA",
            "source": "Website",
            "status": "LOST",
            "priority": "LOW",
            "counsellor_id": priya.id,
            "city": "Jaipur",
            "previous_education": "12th Science",
            "percentage": "68.5%",
            "created_days": 18,
            "notes": "Student selected local government college due to zero hostel expenses.",
            "lost_reason": "Budget / High Fee Structure",
            "lost_notes": "Parents opted for local state college to avoid hostel charges.",
            "lost_at": days_ago(16),
        },
        {
            "lead_id": "LED-2026-1008",
            "student_name": "Arjun Singh",
            "phone": "+91 98450 89012",
            "email": "arjun.singh@gmail.com",
            "course_preference": "B.Tech CSE",
            "source": "WhatsApp",
            "status": "FOLLOW_UP",
            "priority": "HIGH",
            "counsellor_id": rohan.id,
            "city": "Chandigarh",
            "previous_education": "12th CBSE",
            "percentage": "89.5%",
            "created_days": 16, # 15+ days stagnant
            "notes": "Awaiting JEE Main Round 2 results before confirming admission.",
        },
        {
            "lead_id": "LED-2026-1009",
            "student_name": "Deepa Mehta",
            "phone": "+91 98450 90123",
            "email": "deepa.mehta@gmail.com",
            "course_preference": "MBA",
            "source": "Fair",
            "status": "CONVERTED",
            "priority": "URGENT",
            "counsellor_id": neha.id,
            "city": "Indore",
            "previous_education": "BBA Marketing",
            "percentage": "82.3%",
            "created_days": 10,
            "notes": "Executive MBA candidate. Documents validated.",
            "admission_id": "ADM-2026-MBA-094",
            "fee_paid": 100000.0,
            "receipt_number": "REC-2026-4512",
            "enrolled_at": days_ago(3),
            "conversion_remarks": "Direct corporate sponsored seat.",
        },
        {
            "lead_id": "LED-2026-1010",
            "student_name": "Sandeep Reddy",
            "phone": "+91 98450 01234",
            "email": "sandeep.reddy@gmail.com",
            "course_preference": "BCA",
            "source": "Walk-in",
            "status": "INTERESTED",
            "priority": "HIGH",
            "counsellor_id": priya.id,
            "city": "Bangalore",
            "previous_education": "12th Karnataka State",
            "percentage": "81.0%",
            "created_days": 2,
            "notes": "Came for campus visit with uncle. Very impressed with lab infrastructure.",
        },
        {
            "lead_id": "LED-2026-1011",
            "student_name": "Ritu Sen",
            "phone": "+91 98450 11223",
            "email": "ritu.sen@gmail.com",
            "course_preference": "B.Tech CSE",
            "source": "Website",
            "status": "NEW",
            "priority": "MEDIUM",
            "counsellor_id": rohan.id,
            "city": "Kolkata",
            "previous_education": "12th WB Board",
            "percentage": "88.0%",
            "created_days": 0,
            "notes": "Downloaded brochure from website 2 hours ago.",
        },
        {
            "lead_id": "LED-2026-1012",
            "student_name": "Manisha Das",
            "phone": "+91 98450 22334",
            "email": "manisha.das@gmail.com",
            "course_preference": "B.Com",
            "source": "Other",
            "status": "FOLLOW_UP",
            "priority": "MEDIUM",
            "counsellor_id": priya.id,
            "city": "Bhubaneswar",
            "previous_education": "12th Commerce",
            "percentage": "79.4%",
            "created_days": 11,
            "notes": "Alumni referral. Inquiring about CA integrated coaching.",
        },
        {
            "lead_id": "LED-2026-1013",
            "student_name": "Rajesh Kannan",
            "phone": "+91 98450 33445",
            "email": "rajesh.k@gmail.com",
            "course_preference": "B.Tech AI",
            "source": "Phone",
            "status": "LOST",
            "priority": "LOW",
            "counsellor_id": rohan.id,
            "city": "Chennai",
            "previous_education": "12th Tamil Nadu Board",
            "percentage": "94.0%",
            "created_days": 20,
            "notes": "Secured seat in NIT Trichy.",
            "lost_reason": "Enrolled in Competitor",
            "lost_notes": "Student got admission in National Institute of Technology Trichy.",
            "lost_at": days_ago(18),
        },
        {
            "lead_id": "LED-2026-1014",
            "student_name": "Tanvi Shah",
            "phone": "+91 98450 44556",
            "email": "tanvi.shah@gmail.com",
            "course_preference": "BBA",
            "source": "Campaign",
            "status": "INTERESTED",
            "priority": "HIGH",
            "counsellor_id": priya.id,
            "city": "Surat",
            "previous_education": "12th CBSE Commerce",
            "percentage": "85.2%",
            "created_days": 5,
            "notes": "Instagram Ad lead. Interested in International Business specialization.",
        },
        {
            "lead_id": "LED-2026-1015",
            "student_name": "Gaurav Tiwari",
            "phone": "+91 98450 55667",
            "email": "gaurav.t@gmail.com",
            "course_preference": "MCA",
            "source": "Website",
            "status": "CONVERTED",
            "priority": "HIGH",
            "counsellor_id": neha.id,
            "city": "Lucknow",
            "previous_education": "BCA (Grade A)",
            "percentage": "80.5%",
            "created_days": 12,
            "notes": "Admitted with merit scholarship.",
            "admission_id": "ADM-2026-MCA-042",
            "fee_paid": 60000.0,
            "receipt_number": "REC-2026-4430",
            "enrolled_at": days_ago(1),
            "conversion_remarks": "Verified degree certificates and migration certificate.",
        },
    ]

    for item in leads_data:
        created_at = days_ago(item["created_days"])
        lead = Lead(
            lead_id=item["lead_id"],
            student_name=item["student_name"],
            phone=item["phone"],
            email=item["email"],
            course_preference=item["course_preference"],
            source=item["source"],
            status=item["status"],
            priority=item["priority"],
            assigned_counsellor_id=item["counsellor_id"],
            city=item.get("city", ""),
            previous_education=item.get("previous_education", ""),
            percentage=item.get("percentage", ""),
            notes=item.get("notes", ""),
            admission_id=item.get("admission_id"),
            fee_paid=item.get("fee_paid"),
            receipt_number=item.get("receipt_number"),
            enrolled_at=item.get("enrolled_at"),
            conversion_remarks=item.get("conversion_remarks"),
            lost_reason=item.get("lost_reason"),
            lost_notes=item.get("lost_notes"),
            lost_at=item.get("lost_at"),
            created_at=created_at,
            last_contact_date=days_ago(max(0, item["created_days"] - 2)),
        )
        db.add(lead)
        db.flush()

        # Audit Activity: Lead Created
        act1 = Activity(
            lead_id=lead.id,
            user_id=admin.id,
            action="LEAD_CREATED",
            description=f"Lead created from source '{item['source']}'",
            created_at=created_at,
        )
        db.add(act1)

        # Audit Activity: Counsellor Assigned
        if item["counsellor_id"]:
            act2 = Activity(
                lead_id=lead.id,
                user_id=manager.id,
                action="COUNSELLOR_ASSIGNED",
                description="Assigned to admissions counsellor",
                created_at=created_at + datetime.timedelta(hours=2),
            )
            db.add(act2)

        # Follow-ups for active leads
        if item["status"] in ["FOLLOW_UP", "INTERESTED"] or item["lead_id"] == "LED-2026-1001":
            f_done = Followup(
                lead_id=lead.id,
                counsellor_id=item["counsellor_id"] or priya.id,
                scheduled_date=days_ago(1),
                scheduled_time="11:30 AM",
                type="Phone Call",
                status="COMPLETED",
                notes="Explained course curriculum and fee structure.",
                next_action="Send brochure and hostel fee sheet via WhatsApp.",
                completed_at=days_ago(1),
                completion_outcome="Positive - Likely to Apply",
                created_at=days_ago(2),
            )
            db.add(f_done)

            is_overdue = (item["lead_id"] == "LED-2026-1008")
            follow_date = days_ago(2) if is_overdue else days_ahead(1)

            f_pending = Followup(
                lead_id=lead.id,
                counsellor_id=item["counsellor_id"] or priya.id,
                scheduled_date=follow_date,
                scheduled_time="02:30 PM",
                type="Phone Call" if is_overdue else "WhatsApp",
                status="PENDING",
                notes="Follow-up on JEE rank status." if is_overdue else "Confirm parents visit time for campus tour on Saturday.",
                next_action="Call student and check counseling round" if is_overdue else "Coordinate with campus hospitality desk",
                created_at=days_ago(1),
            )
            db.add(f_pending)
            lead.next_followup_date = follow_date

        if item["status"] == "CONVERTED":
            act_conv = Activity(
                lead_id=lead.id,
                user_id=item["counsellor_id"] or admin.id,
                action="LEAD_CONVERTED",
                description=f"Student officially enrolled! Admission ID: {item.get('admission_id')}, Fee Paid: ₹{item.get('fee_paid')}",
                created_at=days_ago(2),
            )
            db.add(act_conv)

    db.commit()
    print(f"[Python Seed] Seeded {len(leads_data)} leads successfully into SQLite database!")
