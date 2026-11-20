
import pytest
from app import app, allowed_file


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


# Test 1: Homepage
def test_homepage_loads(client, monkeypatch):
    monkeypatch.setattr(
        "app.database.get_dashboard_stats", lambda: {}
    )
    monkeypatch.setattr(
        "app.database.get_all_complaints", lambda *args, **kwargs: []
    )

    response = client.get("/")
    assert response.status_code == 200


# Test 2: Complaint report page
def test_report_page_loads(client):
    response = client.get("/report")
    assert response.status_code == 200


# Test 3: AI detects electrical problems
def test_ai_electrical_detection(client):
    response = client.post(
        "/api/ai/suggest",
        json={"description": "There are sparks in the electric wire"}
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert data["category"] == "Electrical"
    assert data["urgency"] == "Critical"


# Test 4: AI detects plumbing problems
def test_ai_plumbing_detection(client):
    response = client.post(
        "/api/ai/suggest",
        json={"description": "Water pipe is leaking"}
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["category"] == "Plumbing"
    assert data["suggestedDepartment"] == "Plumber"


# Test 5: AI handles empty description
def test_ai_empty_description(client):
    response = client.post(
        "/api/ai/suggest",
        json={"description": ""}
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert data["category"] == "Other"


# Test 6: Staff role switching
def test_switch_role(client):
    response = client.post(
        "/switch-role",
        data={"role": "Electrician"}
    )

    assert response.status_code == 302

    with client.session_transaction() as session:
        assert session["current_role"] == "Electrician"


# Test 7: Invalid role is rejected
def test_invalid_role(client):
    client.post(
        "/switch-role",
        data={"role": "Invalid Role"}
    )

    with client.session_transaction() as session:
        assert "current_role" not in session


# Test 8: Allowed image formats
def test_allowed_image_files():
    assert allowed_file("photo.png") is True
    assert allowed_file("photo.jpg") is True
    assert allowed_file("photo.webp") is True


# Test 9: Disallowed image formats
def test_disallowed_files():
    assert allowed_file("document.pdf") is False
    assert allowed_file("script.exe") is False
    assert allowed_file("image") is False


# Test 10: Invalid URL handling
def test_page_not_found(client):
    response = client.get("/this-page-does-not-exist")

    assert response.status_code == 404
