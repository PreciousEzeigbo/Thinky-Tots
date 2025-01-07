from flask import Blueprint, Flask, render_template, jsonify, request, redirect, url_for, flash, session
from flask_login import login_user, logout_user, current_user, login_required, LoginManager
from werkzeug.security import check_password_hash
from sqlalchemy import desc

from public.models import User, db,  QuizScore, AlphaScore

import random


def register_routes(app, db, bcrypt):
    public_bp = Blueprint('public', __name__, template_folder='templates', static_folder='static')

    @public_bp.route('/')
    def index():
        return render_template("index.html")
    
    @public_bp.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'GET':
            return render_template('register.html')

        elif request.method == 'POST':
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            confirmPassword = request.form.get('confirmPassword')

            print(f"Received data: username={username}, email={email}, password={password}, confirmPassword={confirmPassword}")

            # Validate required fields
            if not username or not email or not password or not confirmPassword:
                flash("All fields are required", 'danger')
                print("Validation failed: missing fields")
                return redirect(url_for('public.register'))

            # Check if the passwords match
            if password != confirmPassword:
                flash("Passwords do not match", 'danger')
                print("Validation failed: passwords don't match")
                return redirect(url_for('public.register'))

           # Check if the username or email already exists
            if User.query.filter_by(username=username).first():
                flash("User already exists", 'danger')
                print("Validation failed: username already exists")
                return redirect(url_for('public.register'))

            if User.query.filter_by(email=email).first():
                flash("Email already in use", 'danger')
                print("Validation failed: email already in use")
                return redirect(url_for('public.register'))


            # Create and save the new user
            new_user = User(username=username, email=email)


            # Hash the password
            try:
                new_user.set_password(password)
                print(f"Hashed password: {new_user.password}")

                db.session.add(new_user)
                db.session.commit()
                flash("Registration successful!", 'success')
                print(f"User {username} registered successfully!")
                return redirect(url_for('public.login'))
            except Exception as e:
                db.session.rollback()
                flash(f"An error occurred: {str(e)}", 'danger')
                print(f"Error during registration: {str(e)}")
                return redirect(url_for('public.register'))

    
    @public_bp.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'GET':
            return render_template("login.html")
        elif request.method == 'POST':
            userIdentifier = request.form.get('userIdentifier')
            password = request.form.get('password')

            print(f"User Identifier: {userIdentifier}")
            print(f"Password: {password}")

            # Retrieve user from database
            user = User.query.filter((User.email == userIdentifier) | (User.username == userIdentifier)).first()
            print(f"User found: {user}")

            if user:
                if user.check_password(password):
                    print("User and Password is correct!")
                    # User exists and password is correct
                    login_user(user)
                    return redirect(url_for('public.home'))
                else:
                    print("Incorrect password!")
                    flash('Invalid password, please try again.', 'danger')
                    return redirect(url_for('public.login'))
            else:
                print("No user found with the provided identifier!")
                # Invalid credentials
                flash('Invalid userIdentifier or password', 'danger')
                return redirect(url_for('public.login'))
            
            
    @public_bp.route('/profile')
    @login_required
    def profile():
        """Render the profile page for logged-in users."""
        if request.method == 'POST':
            # Get form data
            full_name = request.form.get('fullName')
            birthday = request.form.get('birthday')

            # Update the current user's profile
            current_user.full_name = full_name
            current_user.birthday = birthday

            # Save changes to the database
            try:
                db.session.commit()
                flash("Profile updated successfully!", 'success')
            except Exception as e:
                db.session.rollback()
                flash(f"Error updating profile: {str(e)}", 'danger')
            
            return redirect(url_for('public.profile'))
        return render_template("profile.html", user=current_user)
    

    @public_bp.route('/forgotten', methods=['GET', 'POST'])
    def forgotten():
        if request.method == 'GET':
            return render_template('forgotten.html')
        elif request.method == 'POST':
            pass
    
    @public_bp.route('/logout')
    def logout():
        logout_user()
        flash('You have been logged out.', 'info')
        return redirect(url_for('public.login'))
    
    @public_bp.route('/home')
    @login_required
    def home():
        """Home page route (or dashboard page)"""
        return render_template("home.html")
    
    @public_bp.route('/alphas')
    @login_required
    def alphas():
        """ Alphabets Puzzle """
        return render_template("alphas.html")

    @public_bp.route('/mathquiz')
    @login_required
    def mathquiz():
        """Math Quiz route"""
        return render_template("mathquiz.html")
    
    @public_bp.route('/main_scores')
    @login_required
    def main_scores():
        '''Scores page for both Alpha and Mathquiz'''
        return render_template("main_scores.html")
    

    @public_bp.route('/api/scores', methods=['POST'])
    @login_required
    def save_score():
        data = request.json
        
        new_score = QuizScore(
            user_id=current_user.uid,
            score=data['score'],
            questions_answered=data['questionsAnswered'],
            max_difficulty=data['maxDifficulty'],
            time_taken=600 - data['timeLeft']
        )
        
        db.session.add(new_score)
        db.session.commit()
        
        return jsonify({'message': 'Score saved successfully'})

    @public_bp.route('/api/scores/personal', methods=['GET'])
    @login_required
    def get_personal_scores():
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        scores = QuizScore.query\
            .filter_by(user_id=current_user.uid)\
            .order_by(
                QuizScore.score.desc(), 
                QuizScore.created_at.desc()
            ).paginate(page=page, per_page=per_page)
        
        return jsonify({
            'scores': [score.to_dict() for score in scores.items],
            'total_pages': scores.pages,
            'current_page': scores.page
        })

    @public_bp.route('/api/scores/leaderboard', methods=['GET'])
    def get_leaderboard():
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        scores = QuizScore.query\
            .order_by(
                QuizScore.score.desc(), 
                QuizScore.created_at.desc()
            ).paginate(page=page, per_page=per_page)
        
        return jsonify({
            'scores': [score.to_dict() for score in scores.items],
            'total_pages': scores.pages,
            'current_page': scores.page
        })

    @public_bp.route('/scores')
    @login_required
    def scores():
        return render_template('mathscores.html')
    
    @public_bp.route('/api/alpha_scores', methods=['POST'])
    @login_required
    def save_alpha_score():
        data = request.json
        
        new_score = AlphaScore(
            user_id=current_user.uid,
            score=data['score'],
            time_taken=data['timeTaken']
        )
        
        db.session.add(new_score)
        db.session.commit()
        
        return jsonify({'message': 'Score saved successfully'})

    @public_bp.route('/api/alpha_scores/personal', methods=['GET'])
    @login_required
    def get_personal_alpha_scores():
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        scores = AlphaScore.query\
            .filter_by(user_id=current_user.uid)\
            .order_by(
                AlphaScore.score.desc(), 
                AlphaScore.created_at.desc()
            ).paginate(page=page, per_page=per_page)
        
        return jsonify({
            'scores': [score.to_dict() for score in scores.items],
            'total_pages': scores.pages,
            'current_page': scores.page
        })

    @public_bp.route('/api/alpha_scores/leaderboard', methods=['GET'])
    def get_alpha_leaderboard():
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        scores = AlphaScore.query\
            .order_by(
                AlphaScore.score.desc(), 
                AlphaScore.created_at.desc()
            ).paginate(page=page, per_page=per_page)
        
        return jsonify({
            'scores': [score.to_dict() for score in scores.items],
            'total_pages': scores.pages,
            'current_page': scores.page
    })

    @public_bp.route('/alpha_scores')
    @login_required
    def alpha_scores():
        return render_template('alpha_scores.html')

    # Custom error pages

    # Invalid pages
    @public_bp.errorhandler(404)
    def page_not_found(e):
        return render_template("404.html"), 404

    # Internal server error pages
    @public_bp.errorhandler(500)
    def server_error(e):
        return render_template("500.html"), 500

    # Register Blueprint with the public_bp
    app.register_blueprint(public_bp)
