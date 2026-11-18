"""
This file is the heart of the web app. It:
1. Loads configuration from .env.
2. Defines web routes (Home, Report, Admin, Complaint Detail).
3. Handles secure photo uploads.
4. Interacts with the database functions in database.py.
"""

import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
from flask import (
    Flask, render_template, request, redirect,
    url_for, flash, abort
)
from werkzeug.utils import secure_filename

import database

# Load environment variables from .env file
load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# Application Configuration from .env
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
app.config["DATABASE"] = os.getenv("DATABASE", "campus_issues.db")
app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "static/uploads")

# Limit upload file size (default 16MB)
max_mb = int(os.getenv("MAX_CONTENT_LENGTH_MB", 16))
app.config["MAX_CONTENT_LENGTH"] = max_mb * 1024 * 1024

# Allowed file extensions for photo uploads
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

# Campus Location list as requested in prompt
CAMPUS_LOCATIONS = [
    "Block A",
    "Block B",
    "Hostel",
    "Canteen",
    "Library",
    "Ground",
    "Other"
]

# Issue Categories and Urgency levels for student reports
CATEGORIES = [
    "Electrical",
    "Plumbing",
    "Cleanliness",
    "Infrastructure / Furniture",
    "Wi-Fi / Tech",
    "Other"
]

URGENCY_LEVELS = ["Low", "Medium", "High"]

STATUS_OPTIONS = ["Pending", "In Progress", "Resolved", "Rejected"]

# Register database close handler on request teardown
app.teardown_appcontext(database.close_db)

def allowed_file(filename):
    """
    Checks if a file has an approved extension.
    Example: 'photo.jpg' -> True, 'script.exe' -> False
    """
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_photo(file_storage):
    """
    Saves an uploaded photo safely:
    1. Strips dangerous characters using secure_filename().
    2. Adds a unique timestamp prefix so files never overwrite each other.
    3. Saves into the static/uploads folder.
    Returns the saved filename string, or None if no file uploaded.
    """
    if not file_storage or file_storage.filename == "":
        return None

    if not allowed_file(file_storage.filename):
        raise ValueError("Invalid file type. Allowed formats: PNG, JPG, JPEG, GIF, WEBP.")

    original_name = secure_filename(file_storage.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:6]
    safe_filename = f"{timestamp}_{unique_id}_{original_name}"

    # Ensure uploads folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    destination_path = os.path.join(app.config["UPLOAD_FOLDER"], safe_filename)
    file_storage.save(destination_path)

    return safe_filename

@app.context_processor
def inject_global_data():
    """
    Makes commonly used constants available to every HTML template
    without having to pass them in each render_template call.
    """
    return {
        "locations": CAMPUS_LOCATIONS,
        "categories": CATEGORIES,
        "urgencies": URGENCY_LEVELS,
        "statuses": STATUS_OPTIONS,
        "now_year": datetime.now().year
    }

# ----------------- ROUTES ----------------- #

@app.route("/")
def index():
    """
    Home Page:
    - Displays portal welcome banner.
    - Shows real-time statistics (total, pending, resolved).
    - Lists the latest campus complaints so students can see current issues.
    """
    stats = database.get_dashboard_stats()
    recent_complaints = database.get_all_complaints()[:6]  # show latest 6
    return render_template("index.html", stats=stats, recent_complaints=recent_complaints)

@app.route("/report", methods=["GET", "POST"])
def report():
    """
    Report a Problem Page:
    - GET: Displays the complaint submission form.
    - POST: Validates input, saves optional photo, and stores complaint in SQLite.
    """
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        location = request.form.get("location", "").strip()
        category = request.form.get("category", "Other").strip()
        urgency = request.form.get("urgency", "Medium").strip()
        photo_file = request.files.get("photo")

        # Basic Form Validation
        errors = []
        if not title:
            errors.append("Please enter a short, descriptive title.")
        elif len(title) > 120:
            errors.append("Title is too long (maximum 120 characters).")

        if not description:
            errors.append("Please provide a description of the problem.")

        if not location or location not in CAMPUS_LOCATIONS:
            errors.append("Please select a valid campus location.")

        if category not in CATEGORIES:
            category = "Other"

        if urgency not in URGENCY_LEVELS:
            urgency = "Medium"

        photo_path = None
        if photo_file and photo_file.filename != "":
            try:
                photo_path = save_uploaded_photo(photo_file)
            except ValueError as e:
                errors.append(str(e))

        if errors:
            for error in errors:
                flash(error, "danger")
            # Preserve user input on error
            return render_template(
                "report.html",
                form_data={
                    "title": title,
                    "description": description,
                    "location": location,
                    "category": category,
                    "urgency": urgency
                }
            )

        # Insert into SQLite Database
        new_id = database.insert_complaint(
            title=title,
            description=description,
            location=location,
            category=category,
            urgency=urgency,
            photo_path=photo_path
        )

        flash(
            f"Success! Complaint #{new_id} was submitted successfully. Campus staff will review it shortly.",
            "success"
        )
        return redirect(url_for("complaint_detail", complaint_id=new_id))

    return render_template("report.html", form_data={})

@app.route("/admin")
def admin():
    """
    Admin Management Dashboard:
    - Shows summary metric cards (Total, Pending, In Progress, Resolved).
    - Lists all complaints in a clean, responsive table.
    - Provides filters by Status, Location, and text Search.
    - Allows direct status updates.
    """
    status_filter = request.args.get("status", "").strip() or None
    location_filter = request.args.get("location", "").strip() or None
    search_query = request.args.get("search", "").strip() or None

    complaints = database.get_all_complaints(
        status_filter=status_filter,
        location_filter=location_filter,
        search_query=search_query
    )
    stats = database.get_dashboard_stats()

    return render_template(
        "admin.html",
        complaints=complaints,
        stats=stats,
        current_status=status_filter,
        current_location=location_filter,
        search_query=search_query or ""
    )

@app.route("/complaint/<int:complaint_id>")
def complaint_detail(complaint_id):
    """
    Single Complaint Detail Page:
    - Shows complete details, full-size photo, current status, and timestamps.
    """
    complaint = database.get_complaint_by_id(complaint_id)
    if not complaint:
        abort(404, description="Complaint not found.")
    return render_template("detail.html", complaint=complaint)

@app.route("/admin/complaint/<int:complaint_id>/status", methods=["POST"])
def update_complaint_status(complaint_id):
    """
    Admin Action: Change the status of a complaint (Pending, In Progress, Resolved, Rejected).
    """
    new_status = request.form.get("status", "").strip()
    try:
        database.update_status(complaint_id, new_status)
        flash(f"Complaint #{complaint_id} status updated to '{new_status}'.", "info")
    except ValueError as e:
        flash(str(e), "danger")

    # Redirect back to referring page or admin table
    redirect_target = request.referrer or url_for("admin")
    return redirect(redirect_target)

@app.route("/admin/complaint/<int:complaint_id>/delete", methods=["POST"])
def delete_complaint_route(complaint_id):
    """
    Admin Action: Delete a complaint record and its attached photo if present.
    """
    complaint = database.delete_complaint(complaint_id)
    if complaint and complaint["photo_path"]:
        photo_file = os.path.join(app.config["UPLOAD_FOLDER"], complaint["photo_path"])
        if os.path.exists(photo_file):
            try:
                os.remove(photo_file)
            except OSError:
                pass

    flash(f"Complaint #{complaint_id} has been permanently deleted.", "warning")
    return redirect(url_for("admin"))

@app.errorhandler(404)
def page_not_found(e):
    """Clean custom 404 error page."""
    return render_template("404.html", error=e), 404

# CLI command: run 'flask init-db' from terminal to reset or initialize DB
@app.cli.command("init-db")
def init_db_command():
    """Initializes the database and seeds sample complaints."""
    database.init_db()
    database.seed_sample_data()
    print("Initialized the FixMyCampus database with sample data.")

# Auto-initialize database on application launch if it does not exist
with app.app_context():
    db_file = os.getenv("DATABASE", "campus_issues.db")
    if not os.path.exists(db_file):
        database.init_db()
        database.seed_sample_data()

if __name__ == "__main__":
    # Runs development server on port 5000
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
