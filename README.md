# EduLead — Admission Lead Management System

> **Candidate Pre-Drive Assessment Brief — Assignment 5 (Edumerge Solutions)**  
> Built with **Python (FastAPI + SQLAlchemy + SQLite)** and **React (Vite + Tailwind CSS + Recharts)**.

---

## 📌 Project Overview

**EduLead** is an admission lead CRM built for higher education institutions. It manages prospective student inquiries from initial contact through counsellor assignment, multi-touch follow-ups, dynamic ageing analysis, and final enrollment conversion.

```
New Lead ➔ Assign Counsellor ➔ Contact Lead ➔ Schedule Follow-up ➔ Interested ➔ Application ➔ Converted
                                                                                   ↘ Lost ➔ Recover
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### Step-by-Step Run Instructions

1. **Clone & Navigate:**
   ```bash
   cd TASK
   ```

2. **Run Everything with One Command:**
   ```bash
   node run-dev.js
   ```
   *This automatically starts the FastAPI SQL backend on port 5000 and the Vite React frontend on port 5173.*

3. **Access the Application:**
   - **Frontend Web Portal:** [http://localhost:5173](http://localhost:5173)
   - **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
   - **Interactive API Docs (Swagger):** [http://localhost:5000/docs](http://localhost:5000/docs)

---

## 👥 Demo Logins & Roles

The login page includes **1-Click Quick Selector Tabs** and pre-fills credentials automatically:

| Role | Name | Email | Password | Primary Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Suresh Sharma | `admin@edulead.edu` | `Admin@123` | Institutional governance, team management, all reports |
| **Manager** | Ananya Deshmukh | `manager@edulead.edu` | `Admin@123` | Lead re-allocation, bulk reassignment, ageing review |
| **Counsellor** | Priya Nair | `priya@edulead.edu` | `Admin@123` | UG Admissions (BCA, BBA, B.Com leads & follow-ups) |
| **Counsellor** | Rohan Verma | `rohan@edulead.edu` | `Admin@123` | Engineering Admissions (B.Tech CSE, AI, MCA) |

*(Backend also accepts `admin` or `admin123` as password for convenience).*

---

## 🎯 Core Features

### 1. Lead Lifecycle Management
- **6-Stage Progression Stepper:** `NEW` ➔ `CONTACTED` ➔ `FOLLOW_UP` ➔ `INTERESTED` ➔ `APPLICATION` ➔ `CONVERTED`.
- **7 Lead Sources:** `Website`, `WhatsApp`, `Walk-in`, `Phone`, `Fair`, `Campaign`, and `Other`.
- **Complete Lead Profile:** 360° student view including course preference, priority, contact details, notes, and academic background.

### 2. Follow-Up Engine & Overdue Tracking
- Scheduled dates, times, and channels (Phone Call, WhatsApp, Campus Visit, Email, Video Consultation).
- Categorized views: **Overdue** (highlighted with alert badge), **Today's Calls**, **Upcoming**, and **Completed History**.
- Outcome recording and next action prompts.

### 3. Dynamic Lead Ageing Analysis
- Real-time calculation of days unresolved in the pipeline:
  - `0–2 days` (Fresh / Active)
  - `3–7 days` (Needs Follow-up)
  - `8–15 days` (At Risk)
  - `15+ days` (Stagnant / Manager Escalation)

### 4. Four Executive Analytics Reports
1. **Source Performance Report:** Total leads, converted admissions, and conversion rate % across all acquisition channels.
2. **Counsellor Performance Benchmark:** Workload comparison, calls completed, and conversion efficiency per staff member.
3. **Stage-by-Stage Conversion Funnel:** Funnel drop-off visualization identifying where students leave the pipeline.
4. **Ageing & Stagnation Matrix:** Flags high-risk leads by age and days since last contact to prevent lead decay.

---

## 🛡️ Edge Cases Handled

- **Cross-Channel Duplicate Detection:** Real-time phone and email checks warning when duplicate inquiries arrive from different sources (e.g. Website vs WhatsApp).
- **Staff Absence / Bulk Reassignment:** 1-click bulk transfer tool reassigning active leads from absent or departing counsellors.
- **Conversion Verification:** Enforces official Admission ID and tuition fee payment details before marking a lead `CONVERTED`.
- **Accidental Lost Recovery:** Single-click lead reinstatement preserving complete audit history.
- **Past-Date Scheduling Prevention:** Blocks scheduling follow-ups on past dates.
- **Role Privacy:** Counsellors can only access leads assigned to them; Managers and Admins maintain institutional oversight.
- **Audit Activity Timeline:** Immutable log recording who made each change, timestamp, and details.

---

## 📂 Project Architecture

```
TASK/
├── client/                     # Vite + React 18 + Tailwind CSS
│   ├── src/
│   │   ├── api/client.js       # Axios with JWT bearer interceptors
│   │   ├── components/         # Layout, Navbar, Sidebar, Badges, Modals
│   │   ├── context/AuthContext # Auth & 1-click role switcher
│   │   ├── pages/              # Dashboard, Leads, LeadDetail, Followups, Counsellors, Reports, Settings
│   │   └── App.jsx
│   └── package.json
├── server_python/              # FastAPI + SQLAlchemy (SQLite) Backend
│   ├── app/
│   │   ├── database.py         # SQLAlchemy engine & SQLite configuration
│   │   ├── models.py           # User, Lead, Followup, Activity, RecoveryHistory tables
│   │   ├── auth.py             # JWT token handling & password hashing
│   │   ├── seed.py             # Auto-seeding 15 realistic student inquiries
│   │   └── routers/            # Auth, Leads, Followups, Counsellors, Reports API
│   ├── requirements.txt
│   ├── main.py
│   └── run.py
├── AI_USAGE_REPORT.md          # Mandatory AI Usage Report (Assessment Form)
├── APPROACH_NOTE.md            # Detailed product thinking & engineering decisions
├── run-dev.js                  # Single-command startup runner
└── package.json
```

---

## 📡 REST API Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Fetch active user profile |
| `GET` | `/api/auth/demo-accounts` | List accounts for 1-click switcher |
| `GET` | `/api/leads` | Search, filter & list admission leads |
| `POST` | `/api/leads` | Create a lead with duplicate verification |
| `POST` | `/api/leads/check-duplicate` | Real-time phone/email duplicate check |
| `GET` | `/api/leads/{id}` | Full 360° lead view with follow-ups & audit timeline |
| `PUT` | `/api/leads/{id}` | Update student inquiry details |
| `PATCH`| `/api/leads/{id}/status` | Status transition (validates conversion / lost reason) |
| `POST` | `/api/leads/{id}/recover` | Reopen accidentally lost lead |
| `POST` | `/api/leads/bulk-reassign` | Transfer leads between counsellors |
| `GET` | `/api/followups` | Agenda view (overdue, today, upcoming, completed) |
| `POST` | `/api/followups` | Schedule follow-up with past date validation |
| `PATCH`| `/api/followups/{id}/complete` | Mark follow-up done with outcome notes |
| `GET` | `/api/reports/dashboard` | KPI metrics, pipeline funnel, sources, ageing |
| `GET` | `/api/reports/analytics` | The 4 required institutional reports |
| `GET` | `/api/health` | Service health status |
