# 🏛️ FixMyCampus - Smart Campus Civic & Complaint Resolution Portal

> **A modern, transparent web application for college campuses where students report infrastructure and civic problems, track which specific staff member owns the ticket, and follow real-time visual progress until verified resolution.**

---

## 📌 Problem Statement
In universities and colleges, campus maintenance issues—such as leaking water coolers, sparking electrical sockets, broken study desks, offline lab Wi-Fi, or unhygienic washrooms—are often trapped in informal WhatsApp messages, paper logbooks, or forgotten emails. Students are left in the dark:
- *Did anyone receive my complaint?*
- *Which technician or warden is responsible for fixing it?*
- *Why has this issue remained unresolved for days without escalation?*

## 💡 The Solution
**FixMyCampus** transforms campus maintenance into a transparent, accountable civic workflow:
1. **Snap & Report**: Students take up to 3 photos directly via mobile camera with automatic device-side compression.
2. **AI Smart Routing (Local Engine)**: Analyzes the problem description to suggest category, urgency, department, and a one-line summary — runs entirely in-browser, zero cloud dependencies.
3. **Live Visual Timeline**: Every complaint receives a unique ID (e.g. `FMC-2026-0001`) and a 5-stage tracking timeline (`Submitted` ➔ `Received by Dept` ➔ `Assigned to Staff` ➔ `In Progress` ➔ `Resolved`).
4. **48-Hour SLA Escalation**: If an issue remains unresolved for over 48 hours, it automatically escalates to Tier 2 (Maintenance Head) and Tier 3 (Principal Office).
5. **Verified Resolution**: Staff upload "After" photos upon completion. The student inspects the fix, confirms with a **1 to 5 star rating**, or reopens the ticket with a reason.
6. **Community Upvoting ("Me Too")**: Common problems rise to the top of the Public Board so administration knows what affects the most students.

---

## 🚀 Key Features

### 1. 🎓 Student Experience
- **Quick Sign Up & Sign In**: Supports Firebase Authentication (Email/Password & Google), plus **1-Click Instant Demo Login**.
- **Camera & Photo Capture**: Native camera capture via HTML5 `capture="environment"` or live in-browser webcam viewfinder with front/back camera toggle.
- **Client-Side Compression**: Automatically shrinks high-resolution 5–10MB phone snapshots to ~200–300KB JPEG using HTML5 canvas, saving mobile bandwidth.
- **AI Auto-Assist**: Generates suggestions for Title, Category, Urgency, and Assigned Department with 1 click — powered by a local NLP engine (no API keys needed).
- **Track Complaint by ID**: Instant search bar (e.g., `FMC-2026-0001`) with direct visual timeline display.
- **Resolution Confirmation**: 1–5 star rating review system and "Reopen Ticket" option.

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

### 3. ⏱️ Visual Timeline & Accountability
Each event records:
- Status badge with color coding
- Exact date, time, and relative timestamp (e.g. `2h ago`)
- Full name, role, and avatar of the staff member who took action
- Official technician notes & remarks
- Side-by-side **Before vs After Photo** comparison

### 4. 📊 Admin Analytics Dashboard & Executive Intelligence
- **Operational Metrics**: Total tickets, open, in-progress, resolved, resolution rate (%), and average resolution time.
- **Interactive Recharts Visualizations**:
  - Category frequency bar chart (Electrical, Plumbing, Sanitation, Wi-Fi, Furniture, etc.)
  - Campus location distribution donut chart
  - Incident urgency horizontal bar chart
  - Benchmark SLA resolution speed breakdown
- **Department Efficiency Matrix**: Live performance tracking across all 8 campus departments with average SLA hours and escalation rates.
- **Print / PDF Summary**: One-click printable maintenance report.

### 5. 🤖 Local AI Assistant Widget ("Ask Campus AI")
- Floating interactive campus assistant powered by the built-in NLP engine.
- Instant answers regarding college maintenance policies, 48-hour SLA escalation rules, and emergency helpline extensions.
- Runs 100% offline in-browser — no external API keys, no cloud calls, no data leaves the device.

### 6. 🔔 Civic Community & Notifications
- **Public Issues Board**: Filter by Category, Location, and Status.
- **"Me Too" Upvoting**: Students upvote issues affecting them so high-impact problems are prioritized.
- **In-App Notification Bell**: Real-time alerts when complaint status changes.
- **Dark Mode**: Smooth transition between light and dark themes with persistent storage.
- **Mobile-First Responsive Design**: Includes bottom navigation bar optimized for smartphones.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18 (Vite, fast HMR) |
| **Routing** | React Router DOM v6 |
| **Data Visualizations** | Recharts v2.13 (Bar, Pie, Donut & Area Charts) |
| **Styling & UI** | Tailwind CSS v3, Plus Jakarta Sans, Custom Glassmorphism |
| **Icons** | Lucide React |
| **Backend & Cloud** | Firebase v10 (Authentication, Cloud Firestore, Cloud Storage) |
| **Artificial Intelligence** | Local NLP Engine v2.0 (rule-based, in-browser, zero cloud deps) |
| **Effects & Feedback** | Canvas Confetti, HTML5 Canvas Image Compressor |

---

## 📸 Screenshots & Workflow (Placeholders)

```
[ Hero Section & Live Stats ]       [ Mobile Camera Photo Capture ]
   ┌───────────────────────┐           ┌───────────────────────┐
   │ FixMyCampus           │           │ [Take Photo] [Upload] │
   │ 142 Reported | 94% Fix│           │ 📷 📷 📷 (Compressed) │
   └───────────────────────┘           └───────────────────────┘

[ Visual Tracking Timeline ]        [ Staff Status Update Modal ]
   ┌───────────────────────┐           ┌───────────────────────┐
   │ FMC-2026-0001         │           │ Update to: [Resolved] │
   │ ● Submitted           │           │ Note: "Bearing fixed" │
   │ ● Received (Warden)   │           │ [Upload After Photo]  │
   │ ● In Progress (Staff) │           └───────────────────────┘
   │ ● Resolved ⭐⭐⭐⭐⭐  │
   └───────────────────────┘
```

---

## 💻 How to Run Locally

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (comes with Node.js)

### Step 1: Clone or Navigate to the Project
```bash
cd C:\Users\NITESH\FixMyCampus
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Development Server
```bash
npm run dev
```

The application will start immediately at:
👉 **`http://localhost:5173`**

*(Note: The app is equipped with full preloaded campus seed data and zero-crash demo mode. It works immediately even before configuring Firebase!)*

---

## 🔥 Step-by-Step Firebase Setup Guide

If you want to connect real cloud storage and authentication, follow these simple steps:

### Step A: Set up Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **"Add project"**. Name it `FixMyCampus`.
2. **Authentication**:
   - In the left sidebar, click **Build > Authentication > Get started**.
   - Under **Sign-in method**, enable **Email/Password** and **Google**.
3. **Cloud Firestore**:
   - In the left sidebar, click **Build > Firestore Database > Create database**.
   - Start in **Test mode** (or production mode with appropriate read/write rules).
4. **Cloud Storage (for Photos)**:
   - In the left sidebar, click **Build > Storage > Get started**.
   - Start in **Test mode**.
5. **Get Your Web Config**:
   - Click the gear icon ⚙️ next to **Project Overview** > **Project settings**.
   - Under *Your apps*, click the web icon `</>` to register a web app.
   - Copy the `firebaseConfig` keys.

### Step B: Paste Credentials into `.env`
Open `.env` in the root folder and fill in your Firebase keys:
```env
VITE_FIREBASE_API_KEY=AIzaSy...your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=fixmycampus-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=fixmycampus-xxxx
VITE_FIREBASE_STORAGE_BUCKET=fixmycampus-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

> **Note:** AI features run 100% locally — no Gemini or OpenAI API key is needed!

Restart the dev server:
```bash
npm run dev
```
FixMyCampus will automatically detect your keys and switch from **Local Demo Mode** to **Firebase Cloud Mode**!

---

## 🧪 How to Test (Evaluation Guide)

1. **Test Student Incident Reporting**:
   - Click **"Report Issue"** in the top navigation or bottom mobile bar.
   - Click **"Take Photo"** to test live camera or **"Upload from Gallery"** to select pictures.
   - Notice the automatic **Client-Side Image Compression** badge (e.g. *Optimized 3.8MB → 240KB*).
   - Click **"AI Auto-Assist"** to test the intelligent category & department recommendation engine.
   - Click **"Submit Complaint"** to enjoy the confetti celebration and receive your generated ID (e.g. `FMC-2026-0007`).
2. **Test Live Timeline Tracking**:
   - The app navigates you directly to the Visual Timeline for your new ticket.
   - Inspect the timestamps, assigned staff role, and status badge.
3. **Test 1-Click Role Switching**:
   - In the top right navbar, click the **Demo Role Pill** (e.g. *Student*).
   - Switch to **⚡ Electrician** or **🏠 Hostel Warden**.
   - Visit the **Staff Portal** (`/staff`) to see assigned tickets.
   - Click **"Update Status"**, choose **"Resolved"**, leave a technician remark, and upload an **"After" photo**.
4. **Test Resolution Verification**:
   - Switch back to **Student** and open your complaint.
   - See the side-by-side **Before vs After Photo** comparison!
   - Confirm the resolution with a **1 to 5 star rating** and feedback note.
5. **Test 48-Hour Escalation**:
   - Check ticket `FMC-2026-0003` (created >48 hours ago).
   - Notice the pulsating red **"Escalated (>48h)"** alert pill and automated routing to the Maintenance Head & Principal Office.
6. **Test Public "Me Too" Board**:
   - Go to `/board`.
   - Click **"Upvote"** on any problem to increase the community count. Filter by category, location, or sort by *Most Upvoted*.

---

## 🔮 Future Scope
- **ML Model Upgrade**: Swap the rule-based NLP engine for a Transformers.js or WebLLM-powered model for even smarter classification — the modular architecture makes this a 1-file change.
- **QR Code Scanning**: Print unique QR codes on classroom doors, water coolers, and lab benches so students can scan and prefill location & equipment ID instantly.
- **Push Notifications & WhatsApp Alerts**: Automated WhatsApp or SMS alerts when staff accept work orders.
- **IoT Sensor Alerts**: Water-flow sensors and MCB trip monitors that auto-generate tickets without manual human reporting.
- **Voice-to-Text Reporting**: Multi-lingual voice recording in regional languages converted to English ticket summaries via AI.

---

## 📄 License
This project is open-source and built for civic campus improvement and academic evaluation.
