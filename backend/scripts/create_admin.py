"""CLI script to create an admin or editor user."""

import sys
from getpass import getpass

from sqlalchemy import select

from app.database import SessionLocal
from app.models.admin import AdminUser
from app.models.enums import AdminRole
from app.security import hash_password


def main() -> None:
    print("=== Create Aurelle Home Admin User ===")
    email = input("Email: ").strip().lower()
    if not email or "@" not in email:
        print("Error: A valid email address is required.")
        sys.exit(1)

    with SessionLocal() as db:
        existing = db.scalar(select(AdminUser).where(AdminUser.email == email))
        if existing:
            print(f"Error: An admin user with email '{email}' already exists.")
            sys.exit(1)

        role_input = input("Role (admin / editor) [default: admin]: ").strip().lower()
        if not role_input or role_input == "admin":
            role = AdminRole.ADMIN
        elif role_input == "editor":
            role = AdminRole.EDITOR
        else:
            print(f"Error: Invalid role '{role_input}'. Must be 'admin' or 'editor'.")
            sys.exit(1)

        password = getpass("Password (minimum 12 characters): ")
        if len(password) < 12:
            print("Error: Password must be at least 12 characters.")
            sys.exit(1)

        confirm_password = getpass("Confirm password: ")
        if password != confirm_password:
            print("Error: Passwords do not match.")
            sys.exit(1)

        hashed = hash_password(password)
        admin = AdminUser(
            email=email,
            password_hash=hashed,
            role=role,
        )
        db.add(admin)
        db.commit()

        print(f"Success: Admin user '{email}' created with role '{role.value}'.")


if __name__ == "__main__":
    main()

