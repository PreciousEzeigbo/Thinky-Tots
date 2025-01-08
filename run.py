# Import necessary modules
import sys
import os

# Import the 'create_app' function from the 'public.app' module
from public.app import create_app

# Call the 'create_app' function to initialize the application instance
app = create_app()

# Ensures the app runs only when the script is executed directly.
if __name__ == '__main__':
    # Start the Flask development server with the specified configurations
    app.run(debug=True, host='0.0.0.0', port=5000)
