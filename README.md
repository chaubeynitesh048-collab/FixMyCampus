# 🏛️ FixMyCampus - Smart Campus Civic & Complaint Resolution Portal

> **A modern, responsive web application for college campuses where students report civic and infrastructure problems, track which specific staff member owns the ticket, and follow real-time visual progress until verified resolution.**
>
> **Stack: Python + Flask + SQLite RDBMS + Vanilla JS (No virtual environment required).**

---

## 📌 Problem Statement
In universities and colleges, campus maintenance issues—such as leaking water coolers, sparking electrical sockets, broken study desks, offline lab Wi-Fi, or unhygienic washrooms—are often trapped in informal WhatsApp messages, paper logbooks, or forgotten emails. Students are left in the dark:
- *Did anyone receive my complaint?*
- *Which technician or warden is responsible for fixing it?*
- *Why has this issue remained unresolved for days without escalation?*

## 💡 The Solution
**FixMyCampus** transforms campus maintenance into a transparent, accountable civic workflow:
1. **Snap & Report**: Students take up to 3 photos directly via mobile camera or gallery with automatic client-side canvas compression.
2. **AI Smart Routing (Local NLP)**: Suggests category, urgency, department dispatch, and concise title instantly with zero cloud API keys.
3. **Live Visual Timeline**: Every complaint receives a unique ID (e.g. `FMC-2026-0001`) and a visual tracking stepper (`Submitted` ➔ `Received by Dept` ➔ `Assigned to Staff` ➔ `In Progress` ➔ `Resolved` ➔ `Confirmed`).
4. **48-Hour SLA Escalation**: If an issue remains unresolved for over 48 hours, it automatically escalates to Tier 2 (Campus Maintenance Head) and Tier 3 (Principal Office).
5. **Verified Resolution**: Staff upload "After" photos upon completion. The student inspects the fix, confirms with a **1 to 5 star rating**, or reopens the ticket with a reason.
6. **Community Upvoting ("Me Too")**: Common problems rise to the top of the Public Board via asynchronous AJAX upvoting so administration prioritizes high-impact issues.

---

## 🚀 Key Features

### 1. 🎓 Student Experience
- **Mobile Camera & Photo Capture**: Native camera capture via HTML5 viewfinder or gallery upload with client-side canvas compression.
- **Smart Local AI Auto-Assist**: Instant 1-click classification of problem descriptions into Category, Urgency, and Assigned Department.
- **Complaint ID Search**: Instant search by unique ID (e.g., `FMC-2026-0001`).
- **Resolution Verification**: 1–5 star rating review system and "Reopen Ticket" option if problems persist.

### 2. 🛡️ Staff & Department Roles
Dedicated portal with role-based filtering for:
- 🏠 **Hostel Warden** (Hostel wing and room maintenance)
- ⚡ **Electrician** (Fans, lighting, lab wiring, MCBs)
- 💧 **Plumber** (Taps, RO water coolers, pipelines, drainage)
- 🧹 **Housekeeping & Sanitation** (Washrooms, cafeteria cleanliness, bins)
- 💻 **IT Support & Wi-Fi** (Campus access points, lab networks)
- 📚 **Library In-charge** (Reading hall facilities, silent zones)
- 🛠️ **Campus Maintenance Head** (Civil infrastructure, Tier 2 escalation owner)
- 🏛️ **Principal Office** (Administration oversight, Tier 3 escalation)
- *Includes a 1-Click Instant Persona Switcher in the top navigation.*

### 3. ⏱️ Visual Timeline & Accountability
Each event records:
- Status badge with color coding
- Exact date, time, and relative timestamp (e.g. `2h ago`)
- Full name, role, and department of the staff member who took action
- Official technician notes & remarks
- Side-by-side **Before vs After Photo** comparison

### 4. 📊 Admin Analytics Dashboard & Executive Intelligence
- **Operational Metrics**: Total tickets, open, in-progress, resolved, resolution rate (%), and escalated tickets.
- **Interactive Chart.js Visualizations**:
  - Category frequency chart
  - Campus location distribution doughnut chart
  - Incident urgency breakdown
- **Department Efficiency Matrix**: Live performance tracking across campus departments with resolution rates and average star ratings.
- **Print / PDF Summary**: One-click printable maintenance report.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Backend Framework** | Python 3 + Flask |
| **Relational Database** | SQLite 3 (RDBMS with relational tables & foreign keys) |
| **Frontend & UI** | Jinja2 Templates, Modern CSS (Light & Dark theme), Mobile-First Design |
| **Client Interactivity** | Vanilla JavaScript (Canvas photo compressor, AJAX upvoting, getUserMedia camera) |
| **Data Visualizations** | Chart.js |
| **Artificial Intelligence** | Local NLP Rule-Based Engine (zero cloud API keys required) |

---

## 💻 How to Run (Simple & Direct)

> **No virtual environment setup required!** Runs directly with your installed Python.

### Step 1: Open Terminal in the Project Directory
```powershell
cd C:\Users\NITESH\FixMyCampus
```

### Step 2: Run the Flask Application
```powershell
python app.py
```

### Step 3: Open in Browser
Visit:
👉 **`http://localhost:5000`**

*(Note: The SQLite database `campus_issues.db` is auto-initialized and pre-seeded with 6 realistic complaints with full timelines on first launch!)*

---

## 🧪 Evaluation & Testing Guide

1. **Test Student Incident Reporting (`/report`)**:
   - Fill in description (e.g. "Water cooler leaking near Room 204").
   - Click **"AI Auto-Assist"** to test local classification into *Plumbing*, *High Urgency*, and *Plumber*.
   - Click **"Take Photo"** to test device camera or upload an image.
   - Click **"Submit Complaint"** to generate your unique ID (e.g. `FMC-2026-0007`) and open your visual timeline.
2. **Test 5-Stage Visual Tracking Timeline (`/complaint/<id>`)**:
   - Inspect the stepper milestones, timestamps, staff badges, and technician remarks.
3. **Test 1-Click Role Switcher**:
   - In the top navbar, click the **Role Badge** (e.g. *Student*).
   - Switch to **Electrician**, **Hostel Warden**, or **Maintenance Head**.
   - Notice how the Staff Portal (`/staff`) filters to that department's active queue.
4. **Test Resolution & Before/After Comparison**:
   - On an active ticket, use the **Staff Status Update Panel** to mark it as **"Resolved"** and attach an After Photo.
   - Switch back to **Student** to see the side-by-side **Before vs After Photo** comparison and submit a **5-star review**.
5. **Test 48-Hour SLA Escalation**:
   - Open ticket `FMC-2026-0003` (created >48 hours ago).
   - Notice the pulsating red **"Escalated (>48h)"** alert banner and automated escalation to Tier 2 Maintenance Head.
6. **Test Public "Me Too" Upvoting (`/board`)**:
   - Click **"👍 Me Too"** on any issue. Notice the counter updates asynchronously via AJAX without refreshing the page.
7. **Test Admin Dashboard (`/dashboard`)**:
   - View KPI metric cards, interactive Chart.js graphs, and the Department Efficiency Matrix.
