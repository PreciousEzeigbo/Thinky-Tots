# Import libraries for Flask, database, authentication, and migrations
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_login import LoginManager

# library connections
db = SQLAlchemy() # For database operation
login_manager = LoginManager() # For handling user authentication and session management
bcrypt = Bcrypt() # For password hashing

# Function to create and configure the Flask app
def create_app():
    # Create a Flask app instance with custom template and static folder locations
    app = Flask(__name__, template_folder= 'templates', static_folder='static')

    # App configuration settings
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = "my secret key you should not know"
    app.config['LOGIN_VIEW'] = 'login'

    # Initialize database and password hashing with the app
    db.init_app(app)
    bcrypt.init_app(app)

    # Login manager set up
    login_manager.init_app(app)

    # Configure login messages and redirect for login
    login_manager.login_view = 'public.login'
    login_manager.login_message_category = 'info'

    # Setup Migrate for database migrations
    migrate = Migrate()
    migrate.init_app(app, db)

    # Import models so they can be registered with SQLAlchemy
    from public.models import User

    # Define the user loader function for login
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.filter_by(uid=user_id).first()

    # Import and register app routes
    from public.routes import register_routes
    register_routes(app, db, bcrypt)

    # Return the fully configured Flask app
    return app
