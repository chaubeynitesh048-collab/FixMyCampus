
import getpass
import sqlite3

from app import app
import database


def main():
    with app.app_context():

        conn = database.get_db()

        existing = conn.execute(
            "SELECT id FROM users WHERE role = 'admin'"
        ).fetchone()

        if existing:
            print("An admin account already exists.")
            return

        username = input("Enter admin username: ").strip()
        password = getpass.getpass("Enter admin password: ")
        confirm = getpass.getpass("Confirm admin password: ")

        if not username:
            print("Username cannot be empty.")
            return

        if len(password) < 12:
            print("Admin password must be at least 12 characters.")
            return

        if password != confirm:
            print("Passwords do not match.")
            return

        try:
            database.create_admin_account(username, password)
            print("Admin account created successfully!")

        except sqlite3.IntegrityError:
            print("Admin account could not be created.")
            

if __name__ == "__main__":
    main()
