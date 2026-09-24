# EduLead: Architectural Approach Note & Engineering Decisions

**Assignment 5 — Admission Lead Management**  
**Applicant:** Edumerge Walk-in Candidate  
**Project:** EduLead Admission CRM  

---

## 1. Problem Understanding & Institutional Context

Higher education institutions face unique admissions challenges compared to standard B2B sales:
- **High Inflow Across Fragmented Channels:** Inquiries flood in through digital channels (Website, WhatsApp, Meta/Google Campaigns) and offline touchpoints (Walk-ins, College Fairs, Phone calls).
- **High Decay Rate / Stagnation:** Prospective students often inquire at multiple colleges simultaneously. A delay of 3–5 days in initial outreach severely drops conversion rates.
- **Counsellor Workload Imbalance:** Unequal lead distribution leads to burnout, delayed follow-ups, and student abandonment.
- **Audit & Compliance Need:** Educational institutions require strict accountability: which counsellor contacted the student, what fee concession or scholarship was promised, and why a student dropped out.

**EduLead** is built to solve these specific operational pain points through structured lifecycle automation, real-time duplicate resolution, multi-touch follow-up scheduling, ageing analytics, and granular activity audit trails.

---

## 2. Product Thinking & Assumptions

### Key Assumptions:
1. **Multi-Role Separation:**
   - **Admin (Dean/Director):** Full system governance, staff management, institution-wide policy settings, and executive reporting.
   - **Manager (Admissions Head):** Real-time monitoring of counsellors, lead redistribution, rebalancing workloads, and reviewing stagnant leads.
   - **Counsellor (Admissions Officer):** Focused execution on assigned student inquiries, scheduling follow-ups, updating interaction notes, and advancing leads through the funnel.
2. **Standardized Funnel with Flexible Edge Exits:**
   - Normal progression follows: `NEW` ➔ `CONTACTED` ➔ `FOLLOW_UP` ➔ `INTERESTED` ➔ `APPLICATION` ➔ `CONVERTED`.
   - Any stage can transition to `LOST` if the student enrolls elsewhere or drops out, but this requires an explicit, documented reason.
   - Leads marked `LOST` are never deleted; they can be recovered with a full audit log if a student re-engages.
3. **Ageing Definition:**
   - **Age in Days:** Total days elapsed since the inquiry entered the system.
   - **Days Since Last Contact:** Days since the last recorded staff touchpoint (call, WhatsApp, campus visit).
   - Categorized into operational buckets:
     - `0–2 days` (Fresh / Active Outreach)
     - `3–7 days` (Ongoing Discussion)
     - `8–15 days` (At Risk)
     - `15+ days` (Stagnant / Manager Review Required)

---

## 3. Technical Architecture & Decisions

```
┌────────────────────────────────────────────────────────┐
│               Frontend: React (Vite)                   │
│   Tailwind CSS • Lucide Icons • Recharts • Router v6   │
└───────────────────────────▲────────────────────────────┘
                            │ REST / JSON (Axios + JWT)
┌───────────────────────────▼────────────────────────────┐
│              Backend: Node.js + Express                │
│    JWT Auth • RBAC Middleware • Central Error Handler  │
└───────────────────────────▲────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼────────────────────────────┐
│               Database Adapter (Dual-Mode)             │
│   Primary: MongoDB Atlas / Local MongoDB URI           │
│   Fallback: Embedded Memory Engine (Auto-seeded)       │
└────────────────────────────────────────────────────────┘
```

### Why MERN Stack?
- **Fast Prototyping & Unified Language:** Javascript/Node across client and server ensures rapid development, shared data validation logic, and rich ecosystem support.
- **Document Model (Mongoose):** College admissions data is inherently semi-structured. Leads require nested objects for `conversionDetails`, `recoveryHistory`, `duplicateMatches`, and dynamic arrays of timeline activities.
- **Dual-Mode Database Adapter:** Evaluators might not have a local MongoDB daemon installed. EduLead automatically falls back to an embedded in-memory MongoDB instance with realistic seed data if no external database is configured, ensuring zero setup friction.

---

## 4. Edge Cases & Failure Scenarios Handled

| Edge Case Scenario | Impact if Ignored | EduLead Engineering Solution |
| :--- | :--- | :--- |
| **Duplicate Contact (Same / Cross-Channel)** | Redundant calls from different counsellors, confusing the student and wasting staff time. | Live debounced duplicate detection on phone/email during input. If a duplicate exists across different sources (e.g. Website vs WhatsApp), a warning badge displays existing lead records with an option to link rather than create blind duplicates. |
| **Counsellor Leaves or Takes Leave** | Dozens of active student inquiries go unattended and freeze in the pipeline. | Admin/Manager has a dedicated **Bulk Reassign Wizard** that moves all active inquiries from one counsellor to another in one atomic operation with an audit log. |
| **Scheduling Follow-up in the Past** | Corrupts follow-up queues and hides overdue alerts. | Client-side HTML5 `min={today}` constraint and server-side validation blocking dates prior to today. |
| **Premature Conversion Without Verification** | Inaccurate revenue and enrollment numbers. | Strict validation: `CONVERTED` status requires mandatory `admissionId`, `feePaid`, and `receiptNumber`. |
| **Accidental "Lost" Status** | High-intent prospective student is prematurely dropped from active CRM pipelines. | **Reopen & Recover Lead Workflow**: Records recovery rationale, assigns back to active stage, and preserves full historical notes. |
| **Unauthorized Data Exposure Between Counsellors** | Privacy violation and internal student poaching. | Strict server-side RBAC: Counsellor tokens can only query and mutate leads where `assignedCounsellor === req.user._id`. Managers and Admins retain global institutional visibility. |
| **Concurrent Edit Collisions** | Two counsellors simultaneously updating the same lead overwrite each other's notes. | Optimistic concurrency locking (`__v` version key check) that returns HTTP 409 Conflict if modified concurrently. |
| **Overdue Follow-up Alerting** | Missed appointments with prospective parents/students. | Automated status check computing `scheduledDate < today` for pending follow-ups with an animated badge counter in the top bar and sidebar. |

---

## 5. The 4 Institutional Reports & Insights

1. **Source Performance Report:**
   - Evaluates conversion efficiency across `Website`, `WhatsApp`, `Walk-in`, `Phone`, `Fair`, `Campaign`, and `Other`.
   - Metric: Conversion Rate % = `(Converted Leads / Total Leads) * 100`.
2. **Counsellor Performance Report:**
   - Workload benchmark comparing total assigned inquiries, completed follow-up interactions, and final admissions generated.
3. **Stage-by-Stage Conversion Funnel:**
   - Visual funnel charting step-through rates from `NEW` to `CONVERTED`, highlighting where student interest drops off.
4. **Ageing & Stagnation Matrix:**
   - Highlights leads lingering without resolution, sorting by days since last contact to enable timely manager re-engagement.

---

## 6. Trade-offs & Future Enhancements

- **In-Memory Fallback vs Cloud Database:** While MongoDB Atlas is supported via `.env`, the embedded fallback was prioritized to guarantee instant, error-free local evaluation.
- **Future Integration:** Adding WhatsApp Business Cloud API webhooks for automated incoming lead capture and bidirectional chat logs.
