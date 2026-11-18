-- FixMyCampus Database Schema
-- Table: complaints
-- Stores all campus issue reports submitted by students

CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_path TEXT,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
