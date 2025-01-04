# Import necessary modules for user management and password hashing
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from public.app import db
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class User(db.Model, UserMixin):
    """User model for authentication."""
    __tablename__ = 'users' # Set the name of the table in the database to 'users'

    # Define columns in the 'users' table
    uid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)

    quiz_scores = relationship('QuizScore', back_populates='user')
    alpha_scores = relationship('AlphaScore', back_populates='user')

    # Return the username for easy identification in logs
    def __repr__(self):
        return f'<User: {self.username}>'

    # Return the unique user ID (required by Flask-Login)
    def get_id(self):
        return self.uid

    # Use Werkzeug to hash the password before saving
    def set_password(self, password):
        self.password = generate_password_hash(password)

    # Compare the hashed password with the entered password
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    @property
    def id(self):
        return self.uid
    
class QuizScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    questions_answered = db.Column(db.Integer, nullable=False)
    max_difficulty = db.Column(db.Integer, nullable=False)
    time_taken = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User', back_populates='quiz_scores')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.user.username,
            'score': self.score,
            'questions_answered': self.questions_answered,
            'max_difficulty': self.max_difficulty,
            'time_taken': self.time_taken,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

# In models.py
class AlphaScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.uid'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    time_taken = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    user = db.relationship('User', back_populates='alpha_scores')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.user.username,
            'score': self.score,
            'time_taken': self.time_taken,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }