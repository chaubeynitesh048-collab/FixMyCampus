-- FixMyCampus Database Schema (SQLite)
-- Smart Campus Civic & Complaint Resolution Portal

CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id TEXT UNIQUE NOT NULL,       -- e.g. 'FMC-2026-0001'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    room_block TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'Medium',  -- 'Low', 'Medium', 'High', 'Critical'
    status TEXT NOT NULL DEFAULT 'Submitted', -- 'Submitted', 'Received by Dept', 'Assigned', 'In Progress', 'Resolved', 'Reopened', 'Escalated'
    photo_path TEXT,                         -- primary photo
    photo_paths_json TEXT,                   -- JSON list of up to 3 photos
    after_photo_path TEXT,                   -- resolution proof photo
    assigned_department TEXT NOT NULL DEFAULT 'Maintenance Head',
    assigned_staff_name TEXT,
    assigned_staff_role TEXT,
    reporter_name TEXT DEFAULT 'Student',
    reporter_email TEXT DEFAULT 'student@campus.edu',
    upvotes INTEGER NOT NULL DEFAULT 0,
    student_rating INTEGER,                  -- 1 to 5 stars
    student_feedback TEXT,
    reopen_reason TEXT,
    is_escalated INTEGER NOT NULL DEFAULT 0, -- 1 if unresolved > 48 hours
    escalated_tier INTEGER DEFAULT 1,        -- Tier 1: Dept, Tier 2: Maintenance Head, Tier 3: Principal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS timeline_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    stage TEXT NOT NULL,                     -- e.g. 'Submitted', 'Received by Dept', 'Assigned', 'In Progress', 'Resolved', 'Reopened', 'Escalated'
    action_by_name TEXT NOT NULL,
    action_by_role TEXT NOT NULL,
    remark TEXT,
    after_photo_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS upvotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    user_identifier TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(complaint_id, user_identifier),
    FOREIGN KEY(complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints(location);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_timeline_complaint ON timeline_events(complaint_id);


-- ============================================
-- FIXMYCAMPUS ROLE-BASED AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    role TEXT NOT NULL CHECK (
        role IN ('student', 'staff', 'admin')
    ),

    full_name TEXT NOT NULL,

    college_id TEXT COLLATE NOCASE UNIQUE,
    username TEXT COLLATE NOCASE UNIQUE,

    mobile_number TEXT,
    department TEXT,

    password_hash TEXT,
    staff_code_hash TEXT,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'disabled')),

    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id),

    CHECK (
        (role = 'student'
            AND college_id IS NOT NULL
            AND password_hash IS NOT NULL
            AND staff_code_hash IS NULL
            AND username IS NULL)
        OR
        (role = 'staff'
            AND mobile_number IS NOT NULL
            AND department IS NOT NULL
            AND staff_code_hash IS NOT NULL
            AND password_hash IS NULL
            AND college_id IS NULL
            AND username IS NULL)
        OR
        (role = 'admin'
            AND username IS NOT NULL
            AND password_hash IS NOT NULL
            AND college_id IS NULL
            AND mobile_number IS NULL
            AND staff_code_hash IS NULL)
    )
);

-- Only one Admin account
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_admin
ON users(role)
WHERE role = 'admin';

-- Unique staff mobile numbers
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_staff_mobile
ON users(mobile_number)
WHERE role = 'staff';

CREATE INDEX IF NOT EXISTS idx_users_role_status
ON users(role, status);

