// Listen for the form submission event
document.getElementById('form').addEventListener('submit', (event) => {
    // Retrieve the values entered in the form fields and trim any extra spaces
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    // Use boolean to track the overall form validity
    let valid = true;

    // Username validation
    if (!username) {
        // Show an error message if username is blank
        setErrorFor('username', 'Username cannot be blank');
        valid = false;
    } else if (username.length < 3) {
        // Show an error if the username is too short (less than 3 characters)
        setErrorFor('username', 'Username must be at least 3 characters');
        valid = false;
    } else {
        // If username is valid, show success
        setSuccessFor('username');
    }

    // Email validation
    if (!email) {
        // Show an error message if email is blank
        setErrorFor('email', 'Email cannot be blank');
        valid = false;
    } else if (!validEmail(email)) {
        // Show an error if the email format is not correct
        setErrorFor('email', 'Please enter a valid email address');
        valid = false;
    } else {
        // If email is valid, show success
        setSuccessFor('email');
    }

    // Password validation
    if (!password) {
        // Show an error message if password is blank
        setErrorFor('password', 'Password cannot be blank');
        valid = false;
    } else if (!validPassword(password)) {
        // Show an error if the password doesn't meet the required rules
        setErrorFor('password', 'Password does not meet requirements');
        valid = false;
    } else {
        // If password is valid, show success
        setSuccessFor('password');
    }

    // Confirm password validation
    if (!confirmPassword) {
        // Show an error message if confirm password is blank
        setErrorFor('confirmPassword', 'Please confirm your password');
        valid = false;
    } else if (password !== confirmPassword) {
        // Show an error if the passwords don't match
        setErrorFor('confirmPassword', 'Passwords do not match');
        valid = false;
    } else {
        // If passwords match, show success
        setSuccessFor('confirmPassword');
    }

    // If anything is wrong, stop the form from being submitted
    if (!valid) {
        event.preventDefault();
    }
});

// Function to display an error message and highlight the field in red
function setErrorFor(inputId, message) {
    const formControl = document.getElementById(inputId).parentElement;
    const small = formControl.querySelector('small');
    formControl.className = 'form-control error';
    small.innerText = message;
}

// Function to add success class to form control (no error) and highlight the field in green
function setSuccessFor(inputId) {
    const formControl = document.getElementById(inputId).parentElement;
    formControl.className = 'form-control success';
}

// Function to check if the email follows the correct email format
function validEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Function to check if the password follows the correct rules (e.g., at least 8 characters, a mix of letters, numbers, and special characters)
function validPassword(password) {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%])[A-Za-z\d@$!%]{8,}$/.test(password);
}