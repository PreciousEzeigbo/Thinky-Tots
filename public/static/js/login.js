// Login form handling
const form = document.getElementById('form');
const userIdentifier = document.getElementById('userIdentifier');
const password = document.getElementById('password');

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
                    method: form.method,
                    body: formData,
                });

                // Handle the response from the server
                const data = await response.json();

                if (response.ok) {
                    // If login is successful, check the message from the server
                    if (data.message === 'Login successful') {
                        // Redirect to the page received from the server (Home Page)
                        window.location.href = data.redirect_to;
                    }
                } else {
                    // Handle login failure
                    setErrorFor(userIdentifier, data.error || "Invalid email/username");
                    setErrorFor(password, data.error || "Invalid password");
                }
            } catch (error) {
                console.error("Error submitting form:", error);
            }
        }
    });
}


// Validation function
function checkInputs() {
    const userIdentifierValue = userIdentifier.value.trim();
    const passwordValue = password.value.trim();

    // Use boolean to track the overall form validity
    let valid = true;

    // Email validation
    if (userIdentifierValue === '') {
        // Show an error message if user-identifier is blank
        setErrorFor(userIdentifier, 'userIdentifier cannot be blank');
        valid = false;
    } else {
        // If user-identifier is valid, show success
        setSuccessFor(userIdentifier);
    }

    // Password validation
    if (passwordValue === '') {
        // Show an error message if password is blank
        setErrorFor(password, 'Password cannot be blank');
        valid = false;
    } else {
        // If password is valid, show success
        setSuccessFor(password);
    }
    return valid;
}

// Error display function
function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');

    // Add the error class and set the message
    formControl.className = 'form-control error';
    small.innerText = message;
}

// Success display function
function setSuccessFor(input) {
    const formControl = input.parentElement;

    // Add the success class
    formControl.className = 'form-control success';
}
