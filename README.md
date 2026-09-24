# EduLead — Admission Lead Management System

> **Candidate Pre-Drive Assessment Brief — Assignment 5 (Edumerge Solutions)**  
> Built with **Python (FastAPI + SQLAlchemy + SQLite)** and **React (Vite + Tailwind CSS + Recharts)**.

---

## 🌟 Executive Summary

**EduLead** is an institution-grade Admission Lead Management System designed for colleges and universities managing high inquiry volumes across multiple channels (Website, WhatsApp, Walk-ins, Phone, Fairs, Campaigns). It streamlines the full student acquisition lifecycle:

$$\text{New Lead} \longrightarrow \text{Assigned Counsellor} \longrightarrow \text{Contacted} \longrightarrow \text{Follow-up} \longrightarrow \text{Interested} \longrightarrow \text{Application} \longrightarrow \text{Converted}$$

---

## 🚀 Instant Quick Start

### 1. Requirements
- Python (3.10+)
- Node.js (v18+) & npm

### 2. Launch the Application
EduLead features a **FastAPI backend with SQLite database**:
- Uses **SQLAlchemy ORM** with SQLite (`edulead.db`).
- Automatically creates all relational tables and pre-seeds 15 realistic student inquiries, counsellors, follow-ups, and audit trails on first launch.
- Interactive Swagger API docs available at: [http://localhost:5000/docs](http://localhost:5000/docs).

```bash
# In the root directory (c:\Users\admin\OneDrive\Desktop\TASK)
node run-dev.js
```

Then visit:
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 Pre-configured Demo Accounts

Use the **1-Click Role Switcher** in the top navigation bar or log in with these credentials:

| Role | Name | Email | Password | Scope & Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Suresh Sharma | `admin@edulead.edu` | `Admin@123` | Institutional governance, staff creation, all reports |
| **Manager** | Ananya Deshmukh | `manager@edulead.edu` | `Manager@123` | Lead re-allocation, bulk transfers, ageing monitoring |
| **Counsellor** | Priya Nair | `priya@edulead.edu` | `Priya@123` | UG Admissions (BCA, BBA, B.Com leads & follow-ups) |
| **Counsellor** | Rohan Verma | `rohan@edulead.edu` | `Rohan@123` | Engineering Admissions (B.Tech CSE, AI, MCA) |

---

## 📊 Core Functional Features

### 1. Real-time Lead Dashboard
- 6 Key KPI Widgets: Total Leads, New Leads, Follow-ups, Converted, Lost, Overdue.
- Visual Pipeline Funnel: Real-time volume across stages with step-through percentages.
- Lead Acquisition Channel breakdown: Website, WhatsApp, Walk-in, Phone, Fair, Campaign, Other.
- Ageing Bucket distribution: `0–2 days`, `3–7 days`, `8–15 days`, `15+ days`.

### 2. Complete Lead Lifecycle & 360° Profile
- Interactive 6-step stage progression stepper.
- Follow-up tracker with multi-channel logging (Phone, WhatsApp, Campus Visit, Email, Video).
- Complete Activity Audit Timeline tracking every action with timestamp and user stamp.

### 3. Edge Cases & Reliability Engine
- **Cross-Channel Duplicate Detection:** Real-time phone and email checks warning when duplicate inquiries arrive across disparate channels (e.g. Website + WhatsApp).
- **Staff Turnover / Bulk Reassignment:** 1-click bulk transfer tool reassigning active leads from absent/leaving counsellors.
- **Accidental Lost Recovery:** Single-click lead reinstatement preserving complete audit history.
- **Conversion Verification Gate:** Enforces Admission ID and fee payment confirmation before marking as converted.
- **Past Date Prevention:** Blocks scheduling follow-ups in the past.
- **Overdue Alerting:** Visual badges for stagnant follow-up appointments.

### 4. The 4 Mandatory Institutional Reports
1. **Source Performance Report:** Total leads, conversions, and conversion win rate % per acquisition source.
2. **Counsellor Performance Report:** Workload, completed follow-ups, and enrollment rates per counsellor.
3. **Stage-by-Stage Conversion Funnel:** Drop-off analysis from inquiry to enrollment.
4. **Ageing & Stagnation Matrix:** Flags neglected leads by days since creation and last contact.

---

## 📁 Repository Structure

```
TASK/
├── client/                     # Vite + React 18 + Tailwind CSS Frontend
│   ├── src/
│   │   ├── api/client.js       # Axios with JWT bearer interceptors
│   │   ├── components/         # Layout, Navbar, Sidebar, Badges, Modals
│   │   ├── context/AuthContext # Auth & 1-click role switcher
│   │   ├── pages/              # Dashboard, Leads, LeadDetail, Followups, Counsellors, Reports, Settings
│   │   └── App.jsx
│   └── package.json
├── server_python/              # Python FastAPI + SQLAlchemy (SQLite) Backend
│   ├── app/
│   │   ├── database.py         # SQLAlchemy engine and SQLite setup
│   │   ├── models.py           # User, Lead, Followup, Activity, RecoveryHistory tables
│   │   ├── auth.py             # JWT token handling & password hashing
│   │   ├── seed.py             # Realistic admissions demo dataset
│   │   └── routers/            # Auth, Leads, Followups, Counsellors, Reports API
│   ├── requirements.txt
│   ├── main.py
│   └── run.py
├── server/                     # (Optional) Node.js/Express backend
├── AI_USAGE_REPORT.md          # Mandatory AI Usage Report (Assessment Form)
├── APPROACH_NOTE.md            # Detailed product thinking, architecture & trade-offs
├── run-dev.js                  # Single command dev runner
└── package.json
```

---

## 📡 REST API Summary

- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET  /api/auth/demo-accounts` — Fetch demo accounts for 1-click switching
- `GET  /api/leads` — List leads with multi-faceted filtering, search & ageing
- `POST /api/leads` — Create lead with duplicate check
- `POST /api/leads/check-duplicate` — Real-time duplicate verification
- `GET  /api/leads/:id` — 360° lead details, follow-ups, and audit timeline
- `PATCH /api/leads/:id/status` — Status transition with conversion/lost validation
- `POST /api/leads/:id/recover` — Recover an accidentally lost lead
- `PATCH /api/leads/:id/assign` — Assign or reassign counsellor
- `POST /api/leads/bulk-reassign` — Bulk transfer leads between counsellors
- `GET  /api/followups` — Follow-up calendar (overdue, today, upcoming, completed)
- `POST /api/followups` — Schedule follow-up with past date validation
- `PATCH /api/followups/:id/complete` — Mark follow-up done with outcome notes
- `GET  /api/reports/dashboard` — Dashboard KPI metrics and funnel
- `GET  /api/reports/analytics` — The 4 institutional reports
