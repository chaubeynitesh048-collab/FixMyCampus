"""
database.py - Database management for FixMyCampus

This module handles:
1. Connecting to the SQLite database.
2. Initializing tables using schema.sql.
3. Seeding realistic sample data so the app has content on first run.
4. Clean helper functions for querying and updating complaints.
"""

import os
import sqlite3
from flask import g, current_app

def get_db_path():
    """Get the database file path from environment or default."""
    return os.getenv("DATABASE", "campus_issues.db")

def get_db():
    """
    Opens a new database connection if there is none yet for the
    current application context.
    
    Using sqlite3.Row allows column access by name (e.g., complaint['title']).
    """
    if "db" not in g:
        db_path = get_db_path()
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    """Closes the database connection at the end of the request."""
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    """
    Reads schema.sql and creates all tables if they don't already exist.
    """
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    
    with open("schema.sql", "r", encoding="utf-8") as f:
        schema_script = f.read()
    
    conn.executescript(schema_script)
    conn.commit()
    conn.close()

def seed_sample_data():
    """
    Inserts a few realistic initial complaints if the database is brand new.
    This makes testing and demoing to judges immediate and visual!
    """
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if table already has data
    cursor.execute("SELECT COUNT(*) FROM complaints")
    count = cursor.fetchone()[0]
    
    if count == 0:
        sample_complaints = [
            (
                "Water cooler leaking on 2nd floor",
                "Continuous water leakage near Room 204. Floor is slippery and causing safety hazard.",
                None,
                "Block A",
                "Plumbing",
                "High",
                "Pending"
            ),
            (
                "Ceiling fan making loud screeching noise",
                "Fan #3 in the back row of the main reading hall needs lubrication or replacement.",
                None,
                "Library",
                "Electrical",
                "Medium",
                "In Progress"
            ),
            (
                "Broken bench near basketball court",
                "Wooden bench collapsed partially. Needs carpentry repair.",
                None,
                "Ground",
                "Infrastructure",
                "Low",
                "Resolved"
            ),
            (
                "Wi-Fi router offline in Wing 3",
                "Students in Hostel Wing 3 have no internet connectivity since morning.",
                None,
                "Hostel",
                "Wi-Fi / Tech",
                "High",
                "Pending"
            )
        ]
        
        cursor.executemany(
            """
            INSERT INTO complaints (title, description, photo_path, location, category, urgency, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            sample_complaints
        )
        conn.commit()
    
    conn.close()

def insert_complaint(title, description, location, category, urgency, photo_path=None):
    """
    Inserts a new complaint into the database.
    Default status is 'Pending' as defined in schema.sql.
    Returns the newly created complaint's ID.
    """
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """
        INSERT INTO complaints (title, description, photo_path, location, category, urgency, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending')
        """,
        (title, description, photo_path, location, category, urgency)
    )
    db.commit()
    return cursor.lastrowid

def get_all_complaints(status_filter=None, location_filter=None, search_query=None):
    """
    Fetches all complaints, sorted newest first.
    Supports filtering by status, location, or search keyword.
    """
    db = get_db()
    query = "SELECT * FROM complaints WHERE 1=1"
    params = []
    
    if status_filter:
        query += " AND status = ?"
        params.append(status_filter)
        
    if location_filter:
        query += " AND location = ?"
        params.append(location_filter)
        
    if search_query:
        query += " AND (title LIKE ? OR description LIKE ?)"
        wildcard = f"%{search_query}%"
        params.extend([wildcard, wildcard])
        
    query += " ORDER BY id DESC"
    
    cursor = db.execute(query, params)
    return cursor.fetchall()

def get_complaint_by_id(complaint_id):
    """Fetches a single complaint by its unique ID."""
    db = get_db()
    cursor = db.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
    return cursor.fetchone()

def update_status(complaint_id, new_status):
    """Updates the status of a complaint (e.g., 'In Progress', 'Resolved')."""
    valid_statuses = ["Pending", "In Progress", "Resolved", "Rejected"]
    if new_status not in valid_statuses:
        raise ValueError(f"Invalid status: {new_status}")
        
    db = get_db()
    db.execute(
        "UPDATE complaints SET status = ? WHERE id = ?",
        (new_status, complaint_id)
    )
    db.commit()

def delete_complaint(complaint_id):
    """Deletes a complaint and returns the record (for photo cleanup)."""
    db = get_db()
    complaint = get_complaint_by_id(complaint_id)
    if complaint:
        db.execute("DELETE FROM complaints WHERE id = ?", (complaint_id,))
        db.commit()
    return complaint

def get_dashboard_stats():
    """
    Returns high-level statistics for the admin overview dashboard:
    Total, Pending, In Progress, Resolved counts.
    """
    db = get_db()
    total = db.execute("SELECT COUNT(*) FROM complaints").fetchone()[0]
    pending = db.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Pending'").fetchone()[0]
    in_progress = db.execute("SELECT COUNT(*) FROM complaints WHERE status = 'In Progress'").fetchone()[0]
    resolved = db.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Resolved'").fetchone()[0]
    
    return {
        "total": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved
    }
