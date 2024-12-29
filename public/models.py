# Import necessary modules for user management and password hashing
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from public.app import db


class User(db.Model, UserMixin):
    """User model for authentication."""
    __tablename__ = 'users' # Set the name of the table in the database to 'users'

    # Define columns in the 'users' table
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<User: {self.username}>' # Return the username for easy identification in logs

    def get_id(self):
        return self.uid # Return the unique user ID (required by Flask-Login)

    def set_password(self, password):
        self.password = generate_password_hash(password) # Use Werkzeug to hash the password before saving

    def check_password(self, password):
        return check_password_hash(self.password, password) # Compare the hashed password with the entered password
