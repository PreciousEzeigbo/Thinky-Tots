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
                return jsonify({'error': 'All fields are required'}), 400  # Bad Request

            # Check if the passwords match
            if password != confirmPassword:
                return jsonify({'error': 'Passwords do not match'}), 400 # Bad Request

            # Check if the username or email already exists
            if User.query.filter_by(username=username).first():
                return jsonify({'error': 'User already exists'}), 400 # Bad Request

            if User.query.filter_by(email=email).first():
                return jsonify({'error': 'Email already in use'}), 400 # Bad Request

            # Create and save the new user
            new_user = User(username=username, email=email)
            try:
                new_user.set_password(password) # Hash the password before saving the user

                # Save the new user to the database
                db.session.add(new_user)
                db.session.commit()

                # Return a success response and redirect to login page
                return jsonify({
                    'message': 'Registration successful!',
                    'redirect_to': url_for('public.login')  # Redirect after successful registration
                }), 200  # OK
            except Exception as e:
                db.session.rollback()
                return jsonify({'error': f'An error occurred: {str(e)}'}), 500  # Internal Server Error

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
                    return jsonify({
                        'message': 'Login successful',
                        'redirect_to': url_for('public.home') # Redirect after successful login
                    }), 200 # OK
                else:
                    # Invalid password
                    return jsonify({'error': 'Invalid credentials'}), 401  # Unauthorized
            else:
                # Invalid user
                return jsonify({'error': 'Invalid credentials'}), 401  # Unauthorized
            
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
        return jsonify({
        'message': 'You have been logged out.',
        'redirect_to': url_for('public.login')  # Redirect after successful logout
    }), 200  # OK
    
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
    
    # Math Quiz
    
    # Maths scores page route
    @public_bp.route('/scores')
    @login_required # Only authenticated users can access this route
    def scores():
        return render_template('mathscores.html')
    
    # API route to save maths quiz score
    @public_bp.route('/api/scores', methods=['POST'])
    @login_required  # Only authenticated users can access this route
    def save_score():
        try:
            # Get JSON data from the request
            data = request.json
            if not data:
                return jsonify({'error': 'No data provided'}), 400  # Bad Request
            
            # Extract necessary data
            score = data.get('score')
            questions_answered = data.get('questionsAnswered')
            max_difficulty = data.get('maxDifficulty')
            time_left = data.get('timeLeft')

            # Validate data
            if score is None or questions_answered is None or max_difficulty is None or time_left is None:
                return jsonify({'error': 'Missing required fields'}), 400  # Bad Request

            # Create a new QuizScore object and save to the database
            new_score = QuizScore(
                user_id=current_user.uid,
                score=score,
                questions_answered=questions_answered,
                max_difficulty=max_difficulty,
                time_taken=600 - time_left
            )
            
            # Commit the new score to the database
            db.session.add(new_score)
            db.session.commit()
            
            # Return success response
            return jsonify({'message': 'Score saved successfully'}), 200  # OK

        except Exception as e:
            # Handle any unexpected errors
            db.session.rollback()  # Rollback any changes in case of error
            return jsonify({'error': f'An error occurred: {str(e)}'}), 500  # Internal Server Error

    # API route to get personal maths quiz scores for the current user
    @public_bp.route('/api/scores/personal', methods=['GET'])
    @login_required # Only authenticated users can access this route
    def get_personal_scores():
        page = request.args.get('page', 1, type=int)
        per_page = 10
        
        # Get maths quiz scores for the current user, sorted by score and date
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

    # API route to get the global leaderboard of maths quiz scores
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
    
    # Alphabet Quiz
    
    # Alphabet scores page route
    @public_bp.route('/alpha_scores')
    @login_required # Only authenticated users can access this route
    def alpha_scores():
        return render_template('alpha_scores.html')
    
    # API route to save Alphabets puzzle score
    @public_bp.route('/api/alpha_scores', methods=['POST'])
    @login_required
    def save_alpha_score():
        try:
            # Get JSON data from the request
            data = request.json
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            # Extract necessary data
            score = data.get('score')
            questions_answered = data.get('questionsAnswered')
            time_left = data.get('timeLeft')

            # Validate data
            if score is None or questions_answered is None or time_left is None:
                return jsonify({'error': 'Missing required fields'}), 400

            # Create a new AlphaScore object
            new_score = AlphaScore(
                user_id=current_user.uid,
                score=score,
                questions_answered=questions_answered,
                time_taken=60 - time_left
            )

            # Save to database
            db.session.add(new_score)
            db.session.commit()

            return jsonify({'message': 'Score saved successfully'}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'An error occurred: {str(e)}'}), 500

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

    # Custom error pages

    # Invalid pages
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template("404.html"), 404

    # Internal server error pages
    @app.errorhandler(500)
    def server_error(e):
        return render_template("500.html"), 500


    # Register Blueprint with the public_bp
    app.register_blueprint(public_bp)
