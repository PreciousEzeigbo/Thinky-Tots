// Register form handling
const form = document.getElementById('form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

// Check if the login form exists on the page
if (form) {
    // Add an event listener for the form's submit event
    form.addEventListener('submit', async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Validate form inputs
        if (checkInputs()) {
            // Create a FormData object to submit via fetch
            const formData = new FormData(form);

            try {
                // Use fetch to handle form submission
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                });

                // Handle the response from the server
                const data = await response.json();

                if (response.ok) {
                    // If registration is successful, check the message from the server
                    if (data.message === 'Registration successful!') {
                        // Redirect to the page received from the server (Loginn Page)
                        window.location.href = data.redirect_to;
                    }
                } else {
                    // Handle registration failure
                    setErrorFor(username, data.error || "Invalid username");
                    setErrorFor(email, data.error || "Invalid email");
                    setErrorFor(password, data.error || "Invalid password");
                    setErrorFor(confirmPassword, data.error || "Invalid confirm password");
                }
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        }
    });
}

// Validation function
function checkInputs() {
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();

    // Use boolean to track the overall form validity
    let valid = true;

    // Username validation
    if (!usernameValue) {
        // Show an error message if username is blank
        setErrorFor(username, 'Username cannot be blank');
        valid = false;
    } else if (usernameValue.length < 3) {
        // Show an error if the username is too short (less than 3 characters)
        setErrorFor(username, 'Username must be at least 3 characters');
        valid = false;
    } else {
        // If username is valid, show success
        setSuccessFor(username);
    }

    // Email validation
    if (!emailValue) {
        // Show an error message if email is blank
        setErrorFor(email, 'Email cannot be blank');
        valid = false;
    } else if (!validEmail(emailValue)) {
        // Show an error if the email format is not correct
        setErrorFor(email, 'Please enter a valid email address');
        valid = false;
    } else {
        // If email is valid, show success
        setSuccessFor(email);
    }

    // Password validation
    if (!passwordValue) {
        // Show an error message if password is blank
        setErrorFor(password, 'Password cannot be blank');
        valid = false;
    } else if (!validPassword(passwordValue)) {
        // Show an error if the password doesn't meet the required rules
        setErrorFor(password, 'Password does not meet requirements');
        valid = false;
    } else {
        // If password is valid, show success
        setSuccessFor(password);
    }

    // Confirm password validation
    if (!confirmPasswordValue) {
        // Show an error message if confirm password is blank
        setErrorFor(confirmPassword, 'Please confirm your password');
        valid = false;
    } else if (passwordValue !== confirmPasswordValue) {
        // Show an error if the passwords don't match
        setErrorFor(confirmPassword, 'Passwords do not match');
        valid = false;
    } else {
        // If passwords match, show success
        setSuccessFor(confirmPassword);
    }

    return valid;
}

// Function to display an error message and highlight the field in red
function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');
    formControl.className = 'form-control error';
    small.innerText = message;
}

// Function to add success class to form control (no error) and highlight the field in green
function setSuccessFor(input) {
    const formControl = input.parentElement;
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