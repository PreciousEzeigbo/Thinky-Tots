from flask import Blueprint, Flask, render_template, jsonify, request, redirect, url_for, flash, session
from flask_login import login_user, logout_user, current_user, login_required, LoginManager
from werkzeug.security import check_password_hash
from sqlalchemy import desc

from public.models import User, db,  QuizScore, AlphaScore


def register_routes(app, db, bcrypt):
    # Create a blueprint for the public routes
    public_bp = Blueprint('public', __name__, template_folder='templates', static_folder='static')

    # Home route - renders the landing page
    @public_bp.route('/')
    def index():
        return render_template("index.html")
    
    # Registration route - handles both displaying and submitting the registration form
    @public_bp.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'GET':
            return render_template('register.html')

        # Get form data from the user
        elif request.method == 'POST':
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            confirmPassword = request.form.get('confirmPassword')

            # Validate required fields
            if not username or not email or not password or not confirmPassword:
                flash("All fields are required", 'danger')
                return redirect(url_for('public.register'))

            # Check if the passwords match
            if password != confirmPassword:
                flash("Passwords do not match", 'danger')
                return redirect(url_for('public.register'))

            # Check if the username or email already exists
            if User.query.filter_by(username=username).first():
                flash("User already exists", 'danger')
                return redirect(url_for('public.register'))

            if User.query.filter_by(email=email).first():
                flash("Email already in use", 'danger')
                return redirect(url_for('public.register'))

            # Create and save the new user
            new_user = User(username=username, email=email)

            # Hash the password before saving the user
            try:
                new_user.set_password(password)

                # Save the new user to the database
                db.session.add(new_user)
                db.session.commit()
                flash("Registration successful!", 'success')
                return redirect(url_for('public.login'))
            except Exception as e:
                # Rollback if an error occurs
                db.session.rollback()
                flash(f"An error occurred: {str(e)}", 'danger')
                return redirect(url_for('public.register'))

    # Login route - handles user authentication and login form display
    @public_bp.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'GET':
            return render_template("login.html")
        elif request.method == 'POST':
            # Get login credentials from the form
            userIdentifier = request.form.get('userIdentifier')
            password = request.form.get('password')

            # Retrieve user from database
            user = User.query.filter((User.email == userIdentifier) | (User.username == userIdentifier)).first()

            if user:
                # Check if the password is correct
                if user.check_password(password):
                    # Log in the user
                    login_user(user)
                    return redirect(url_for('public.home'))
                else:
                    flash('Invalid password, please try again.', 'danger')
                    return redirect(url_for('public.login'))
            else:
                # Invalid credentials
                flash('Invalid userIdentifier or password', 'danger')
                return redirect(url_for('public.login'))
            
    # Profile route - shows the user's profile page
    @public_bp.route('/profile')
    @login_required # Only authenticated users can access this route
    def profile():
        """Render the profile page for logged-in users."""
        return render_template("profile.html")
    
    # Logout route - logs the user out and redirects to login page
    @public_bp.route('/logout')
    def logout():
        logout_user()
        flash('You have been logged out.', 'info')
        return redirect(url_for('public.login'))
    
    # Home route (dashboard) - To display dashboard
    @public_bp.route('/home')
    @login_required # Only authenticated users can access this route
    def home():
        """Home page route (or dashboard page)"""
        return render_template("home.html")
    
    # Alphas Puzzle route - displays the alphabets puzzle page
    @public_bp.route('/alphas')
    @login_required # Only authenticated users can access this route
    def alphas():
        """ Alphabets Puzzle """
        return render_template("alphas.html")

    # Math Quiz route - displays the math quiz page
    @public_bp.route('/mathquiz')
    @login_required # Only authenticated users can access this route
    def mathquiz():
        """Math Quiz route"""
        return render_template("mathquiz.html")
    
    # Main Scores route - displays the scores for both Alphabet and Math Quiz
    @public_bp.route('/main_scores')
    @login_required # Only authenticated users can access this route
    def main_scores():
        '''Scores page for both Alpha and Mathquiz'''
        return render_template("main_scores.html")
    
    # API route to save quiz score
    @public_bp.route('/api/scores', methods=['POST'])
    @login_required # Only authenticated users can access this route
    def save_score():
        data = request.json # Get JSON data from the request
        
        # Create a new QuizScore object and save to the database
        new_score = QuizScore(
            user_id=current_user.uid,
            score=data['score'],
            questions_answered=data['questionsAnswered'],
            max_difficulty=data['maxDifficulty'],
            time_taken=600 - data['timeLeft']
        )

        db.session.add(new_score)
        db.session.commit()

        # Return success response
        return jsonify({'message': 'Score saved successfully'})

    # API route to get personal quiz scores for the current user
    @public_bp.route('/api/scores/personal', methods=['GET'])
    @login_required # Only authenticated users can access this route
    def get_personal_scores():
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        # Get quiz scores for the current user, sorted by score and date
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

    # API route to get the global leaderboard of quiz scores
    @public_bp.route('/api/scores/leaderboard', methods=['GET'])
    def get_leaderboard():
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        # Get the top quiz scores from all users
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

    # Scores page route for math scores
    @public_bp.route('/scores')
    @login_required # Only authenticated users can access this route
    def scores():
        return render_template('mathscores.html')
    
    # API route to save Alphabets puzzle score
    @public_bp.route('/api/alpha_scores', methods=['POST'])
    @login_required # Only authenticated users can access this route
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

    # API route to get personal Alphabet puzzle scores
    @public_bp.route('/api/alpha_scores/personal', methods=['GET'])
    @login_required # Only authenticated users can access this route
    def get_personal_alpha_scores():
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        # Get Alphabet puzzle scores for the current user
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

    # API route to get the global leaderboard of Alphabet puzzle scores
    @public_bp.route('/api/alpha_scores/leaderboard', methods=['GET'])
    def get_alpha_leaderboard():
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        # Get the top Alphabet puzzle scores from all users
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

    # Alphabet scores page route
    @public_bp.route('/alpha_scores')
    @login_required # Only authenticated users can access this route
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
