"""
app.py - Main Application Controller for FixMyCampus
A modern civic campus complaint and resolution portal built with Python, Flask, SQLite, and vanilla JS.
"""

import os
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv
from flask import (
    Flask, render_template, request, redirect,
    url_for, flash, jsonify, session, abort
)
from werkzeug.utils import secure_filename

import database

# Load environment configuration
load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "fixmycampus-smart-civic-portal-2026")
app.config["DATABASE"] = os.getenv("DATABASE", "campus_issues.db")
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "static", "uploads")
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH_MB", 16)) * 1024 * 1024

# Ensure upload directory exists
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

# Standard Campus Classifications
CAMPUS_LOCATIONS = [
    "Hostel (Boys)",
    "Hostel (Girls)",
    "Library",
    "Classroom / Lecture Hall",
    "Canteen",
    "Ground / Sports Complex",
    "Computer / Science Lab",
    "Administrative Block",
    "Other"
]

CATEGORIES = [
    "Electrical",
    "Plumbing",
    "Cleanliness / Sanitation",
    "Wi-Fi / Internet",
    "Furniture / Classroom",
    "Library Facilities",
    "Food & Canteen",
    "Safety & Security",
    "Other"
]

URGENCIES = ["Low", "Medium", "High", "Critical"]

STATUSES = [
    "Submitted",
    "Received by Dept",
    "Assigned",
    "In Progress",
    "Resolved",
    "Reopened",
    "Escalated"
]

STAFF_ROLES = [
    {"role": "Student", "name": "Aditya Verma", "dept": "Student Body", "is_staff": False},
    {"role": "Hostel Warden", "name": "Prof. R. K. Sharma", "dept": "Warden", "is_staff": True},
    {"role": "Electrician", "name": "Ramesh Sundaram", "dept": "Electrician", "is_staff": True},
    {"role": "Plumber", "name": "Santosh Kumar", "dept": "Plumber", "is_staff": True},
    {"role": "Housekeeping", "name": "Sunita Devi", "dept": "Housekeeping", "is_staff": True},
    {"role": "IT Support", "name": "Karthik Raja", "dept": "IT Support", "is_staff": True},
    {"role": "Library In-charge", "name": "Dr. Ananya Sen", "dept": "Library In-charge", "is_staff": True},
    {"role": "Maintenance Head", "name": "Vikram Singh", "dept": "Maintenance Head", "is_staff": True},
    {"role": "Principal Office", "name": "Dr. S. K. Mahapatra", "dept": "Principal Office", "is_staff": True},
]

# Database teardown
app.teardown_appcontext(database.close_db)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_photo(file_storage):
    if not file_storage or file_storage.filename == "":
        return None
    if not allowed_file(file_storage.filename):
        return None
    
    original = secure_filename(file_storage.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_suffix = uuid.uuid4().hex[:6]
    safe_name = f"{timestamp}_{unique_suffix}_{original}"
    dest = os.path.join(app.config["UPLOAD_FOLDER"], safe_name)
    file_storage.save(dest)
    return safe_name

def time_ago(dt_val):
    if not dt_val:
        return "Just now"
    if isinstance(dt_val, str):
        try:
            dt_val = datetime.fromisoformat(dt_val.replace("Z", ""))
        except Exception:
            return dt_val
    diff = datetime.now() - dt_val
    s = diff.total_seconds()
    if s < 60:
        return "Just now"
    elif s < 3600:
        m = int(s / 60)
        return f"{m}m ago"
    elif s < 86400:
        h = int(s / 3600)
        return f"{h}h ago"
    else:
        d = int(s / 86400)
        return f"{d}d ago"

def format_date(dt_val):
    if not dt_val:
        return ""
    if isinstance(dt_val, str):
        try:
            dt_val = datetime.fromisoformat(dt_val.replace("Z", ""))
        except Exception:
            return dt_val
    return dt_val.strftime("%b %d, %Y at %I:%M %p")

@app.context_processor
def inject_global_data():
    current_role_name = session.get("current_role", "Student")
    current_role_obj = next((r for r in STAFF_ROLES if r["role"] == current_role_name), STAFF_ROLES[0])
    return {
        "locations": CAMPUS_LOCATIONS,
        "categories": CATEGORIES,
        "urgencies": URGENCIES,
        "statuses": STATUSES,
        "staff_roles": STAFF_ROLES,
        "current_user": current_role_obj,
        "now_year": datetime.now().year,
        "time_ago": time_ago,
        "format_date": format_date
    }

# ----------------- WEB ROUTES ----------------- #

@app.route("/")
def index():
    """Landing Page with hero, live civic stats, and recent campus issues."""
    stats = database.get_dashboard_stats()
    recent = database.get_all_complaints()[:6]
    return render_template("index.html", stats=stats, recent=recent)

@app.route("/report", methods=["GET", "POST"])
def report():
    """Submit a campus problem with photos and local AI assistance."""
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        category = request.form.get("category", "Other").strip()
        location = request.form.get("location", "Other").strip()
        room_block = request.form.get("room_block", "").strip()
        urgency = request.form.get("urgency", "Medium").strip()
        assigned_dept = request.form.get("assigned_department", "Maintenance Head").strip()
        
        errors = []
        if not title:
            errors.append("Please provide a short headline/title for the issue.")
        if not description:
            errors.append("Please describe the problem in detail.")
        if not room_block:
            errors.append("Please specify the exact room, floor, or landmark.")
            
        if errors:
            for err in errors:
                flash(err, "danger")
            return render_template("report.html", form_data=request.form)
            
        # Handle multiple photo uploads
        saved_photos = []
        files = request.files.getlist("photos")
        for f in files:
            if f and f.filename != "":
                saved = save_uploaded_photo(f)
                if saved:
                    saved_photos.append(saved)
                    
        # Also check single 'photo' field
        single_photo = request.files.get("photo")
        if single_photo and single_photo.filename != "":
            saved = save_uploaded_photo(single_photo)
            if saved and saved not in saved_photos:
                saved_photos.append(saved)
                
        # Current reporter info
        current_role_name = session.get("current_role", "Student")
        current_role_obj = next((r for r in STAFF_ROLES if r["role"] == current_role_name), STAFF_ROLES[0])
        
        db_id, comp_id = database.insert_complaint(
            title=title,
            description=description,
            category=category,
            location=location,
            room_block=room_block,
            urgency=urgency,
            photos=saved_photos,
            assigned_department=assigned_dept,
            reporter_name=current_role_obj["name"],
            reporter_email=f"{current_role_obj['name'].lower().replace(' ', '.')}@campus.edu"
        )
        
        flash(f"Complaint {comp_id} submitted successfully! Your tracking timeline has started.", "success")
        return redirect(url_for("complaint_detail", complaint_id=db_id))
        
    return render_template("report.html", form_data={})

@app.route("/board")
def public_board():
    """Public Issues Board with category/location/status filters and upvoting."""
    category = request.args.get("category")
    status = request.args.get("status")
    location = request.args.get("location")
    sort_by = request.args.get("sort", "upvotes")
    search = request.args.get("search", "")
    
    complaints = database.get_all_complaints(
        category_filter=category,
        status_filter=status,
        location_filter=location,
        search_query=search,
        sort_by=sort_by
    )
    
    user_id = session.get("user_id", "demo-session-user")
    for c in complaints:
        c["has_upvoted"] = database.has_user_upvoted(c["id"], user_id)
        
    return render_template(
        "board.html",
        complaints=complaints,
        current_category=category or "All",
        current_status=status or "All",
        current_location=location or "All",
        current_sort=sort_by,
        search_query=search
    )

@app.route("/track")
def track():
    """Search for complaint by ID or view all trackable issues."""
    query = request.args.get("id", "").strip()
    if query:
        # Check custom ID like FMC-2026-0001
        complaint = database.get_complaint_by_custom_id(query)
        if not complaint and query.isdigit():
            complaint = database.get_complaint_by_id(int(query))
        if complaint:
            return redirect(url_for("complaint_detail", complaint_id=complaint["id"]))
        flash(f"No complaint found matching ID '{query}'. Please verify and try again.", "warning")
        
    all_complaints = database.get_all_complaints()
    return render_template("track.html", complaints=all_complaints, search_query=query)

@app.route("/complaint/<int:complaint_id>")
def complaint_detail(complaint_id):
    """Detailed complaint page featuring the 5-stage Visual Tracking Timeline."""
    complaint = database.get_complaint_by_id(complaint_id)
    if not complaint:
        abort(404, description="Complaint not found")
        
    user_id = session.get("user_id", "demo-session-user")
    has_upvoted = database.has_user_upvoted(complaint_id, user_id)
    
    return render_template("detail.html", complaint=complaint, has_upvoted=has_upvoted)

@app.route("/complaint/<int:complaint_id>/status", methods=["POST"])
def update_status(complaint_id):
    """Staff updates complaint milestone, remarks, and optional After Photo."""
    new_status = request.form.get("status", "").strip()
    remark = request.form.get("remark", "").strip()
    after_file = request.files.get("after_photo")
    
    after_photo_path = None
    if after_file and after_file.filename != "":
        after_photo_path = save_uploaded_photo(after_file)
        
    current_role_name = session.get("current_role", "Student")
    current_role_obj = next((r for r in STAFF_ROLES if r["role"] == current_role_name), STAFF_ROLES[0])
    
    staff_name = current_role_obj["name"]
    staff_role = current_role_obj["role"]
    
    database.update_complaint_status(
        complaint_id=complaint_id,
        new_status=new_status,
        staff_name=staff_name,
        staff_role=staff_role,
        remark=remark,
        after_photo_path=after_photo_path
    )
    
    flash(f"Status updated to '{new_status}' with authenticated staff remark.", "success")
    return redirect(url_for("complaint_detail", complaint_id=complaint_id))

@app.route("/complaint/<int:complaint_id>/review", methods=["POST"])
def review_resolution(complaint_id):
    """Student submits 1 to 5 star rating and confirmation."""
    rating = int(request.form.get("rating", 5))
    feedback = request.form.get("feedback", "").strip()
    
    current_role_name = session.get("current_role", "Student")
    current_role_obj = next((r for r in STAFF_ROLES if r["role"] == current_role_name), STAFF_ROLES[0])
    
    database.submit_student_review(complaint_id, rating, feedback, student_name=current_role_obj["name"])
    flash(f"Thank you! Your {rating}-star rating and feedback have been recorded.", "success")
    return redirect(url_for("complaint_detail", complaint_id=complaint_id))

@app.route("/complaint/<int:complaint_id>/reopen", methods=["POST"])
def reopen_ticket(complaint_id):
    """Student reopens a complaint if the fix was incomplete."""
    reason = request.form.get("reason", "").strip()
    if not reason:
        reason = "Problem has re-occurred or was not completely fixed."
        
    current_role_name = session.get("current_role", "Student")
    current_role_obj = next((r for r in STAFF_ROLES if r["role"] == current_role_name), STAFF_ROLES[0])
    
    database.reopen_complaint(complaint_id, reason, student_name=current_role_obj["name"])
    flash("Ticket reopened! The department has been notified to resume work.", "warning")
    return redirect(url_for("complaint_detail", complaint_id=complaint_id))

@app.route("/staff")
def staff_portal():
    """Staff & Department workbench for viewing and managing assigned tickets."""
    current_role_name = session.get("current_role", "Student")
    current_role_obj = next((r for r in STAFF_ROLES if r["role"] == current_role_name), STAFF_ROLES[0])
    
    dept_filter = current_role_obj["dept"]
    if dept_filter == "Student Body":
        dept_filter = "All"
        
    complaints = database.get_all_complaints(department_filter=dept_filter, sort_by="urgency")
    return render_template("staff.html", complaints=complaints, active_dept=dept_filter)

@app.route("/dashboard")
def admin_dashboard():
    """Executive Analytics Dashboard with Chart.js visualization data."""
    stats = database.get_dashboard_stats()
    return render_template("dashboard.html", stats=stats)

@app.route("/switch-role", methods=["POST"])
def switch_role():
    """Instant 1-click role switcher for evaluating student vs staff views."""
    new_role = request.form.get("role", "Student")
    if any(r["role"] == new_role for r in STAFF_ROLES):
        session["current_role"] = new_role
        flash(f"Switched active view to: {new_role}", "info")
    return redirect(request.referrer or url_for("index"))

# ----------------- AJAX / JSON APIS ----------------- #

@app.route("/api/complaints/<int:complaint_id>/upvote", methods=["POST"])
def api_upvote(complaint_id):
    """AJAX endpoint for 'Me Too' upvoting without page refresh."""
    user_id = session.get("user_id")
    if not user_id:
        user_id = f"user_{uuid.uuid4().hex[:8]}"
        session["user_id"] = user_id
        
    has_upvoted, count = database.toggle_upvote(complaint_id, user_id)
    return jsonify({
        "success": True,
        "complaint_id": complaint_id,
        "has_upvoted": has_upvoted,
        "upvotes": count
    })

@app.route("/api/ai/suggest", methods=["POST"])
def api_ai_suggest():
    """
    Local Smart NLP rule-based classifier:
    Suggests category, urgency, department, title, and summary without cloud calls.
    """
    data = request.get_json() or {}
    text = (data.get("description") or "").strip().lower()
    
    category = "Other"
    urgency = "Medium"
    suggested_dept = "Maintenance Head"
    
    # Keyword classification
    if any(w in text for w in ["wire", "spark", "switch", "socket", "fan", "light", "bulb", "electricity", "power", "fuse", "mcb", "shock"]):
        category = "Electrical"
        suggested_dept = "Electrician"
        urgency = "Critical" if any(w in text for w in ["spark", "shock", "fire", "smoke", "burn"]) else "High"
    elif any(w in text for w in ["leak", "water", "pipe", "tap", "drain", "flush", "toilet", "sewage", "sink", "cooler", "overflow"]):
        category = "Plumbing"
        suggested_dept = "Plumber"
        urgency = "High" if any(w in text for w in ["overflow", "flood", "burst", "non-stop", "continuous"]) else "Medium"
    elif any(w in text for w in ["clean", "garbage", "dustbin", "dirty", "smell", "odor", "hygiene", "mop", "washroom", "pest", "trash"]):
        category = "Cleanliness / Sanitation"
        suggested_dept = "Housekeeping"
        urgency = "High" if any(w in text for w in ["washroom", "pest", "foul", "maggot"]) else "Medium"
    elif any(w in text for w in ["wifi", "wi-fi", "internet", "network", "router", "lan", "server", "portal", "computer", "lab"]):
        category = "Wi-Fi / Internet"
        suggested_dept = "IT Support"
        urgency = "High" if any(w in text for w in ["exam", "down", "offline", "entire"]) else "Medium"
    elif any(w in text for w in ["library", "book", "reading", "study"]):
        category = "Library Facilities"
        suggested_dept = "Library In-charge"
    elif any(w in text for w in ["hostel", "warden", "roommate", "curfew", "mess"]):
        category = "Other"
        suggested_dept = "Warden"
    elif any(w in text for w in ["desk", "bench", "chair", "board", "door", "window", "lock", "table", "furniture"]):
        category = "Furniture / Classroom"
        suggested_dept = "Maintenance Head"
        
    words = [w for w in text.split() if len(w) > 3][:6]
    title = " ".join(words).capitalize() if words else "Campus Maintenance Problem"
    if not title.endswith("Issue"):
        title = f"{title} Issue"
        
    return jsonify({
        "success": True,
        "suggestedTitle": title[:60],
        "category": category,
        "urgency": urgency,
        "suggestedDepartment": suggested_dept,
        "oneLineSummary": f"Reported {category} issue. Recommended inspection by {suggested_dept}."
    })

@app.route("/api/stats")
def api_stats():
    """Real-time stats API."""
    stats = database.get_dashboard_stats()
    return jsonify(stats)

@app.errorhandler(404)
def not_found(e):
    return render_template("404.html", error=e), 404

# Application bootstrapping
with app.app_context():
    database.init_db()
    database.seed_sample_data()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
