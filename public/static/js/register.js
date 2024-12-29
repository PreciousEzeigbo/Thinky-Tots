// Registration form handling
const form = document.getElementById('form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');


document.getElementById('form').addEventListener('submit', function(e) {
    // Your validation logic here
    
    // If validation passes
    document.getElementById('success-message').style.display = 'block';
    setTimeout(function() {
        window.location.href = "{{ url_for('public.login') }}";
    }, 2000); // Redirect after 2 seconds
});

// Check if the registration form exists on the page
if (form) {
    // Add an event listener for the form's submit event
    form.addEventListener('submit', async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();
        // Validate form inputs
        checkInputs();
    });

    function checkInputs() {
        // Retrieve the values from the registration form inputs
        const usernameValue = username.value.trim();
        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();
        const confirmPasswordValue = confirmPassword.value.trim();

        let valid = true;

        if (usernameValue === '') {
            // Display error and add the error class
            setErrorFor(username, 'Username cannot be blank');
            valid = false;
        } else {
            // Display success class
            setSuccessFor(username);
        }

        if (emailValue === '') {
            // Display error and add the error class
            setErrorFor(email, "Email cannot be blank");
            valid = false;
        } else if (!validEmail(emailValue)) {
            setErrorFor(email, 'Email is not valid');
            valid = false;
        } else {
            setSuccessFor(email);
        }

        if (passwordValue === '') {
            // Display error and add the error class
            setErrorFor(password, 'Password cannot be blank');
            valid = false;
        } else if (!validPassword(passwordValue)) {
            setErrorFor(password, "Must be Alphanumric with special character!");
            valid = false;
        } else {
            // Display success class
            setSuccessFor(password);
        }

        if (confirmPasswordValue === '') {
            // Display error and add the error class
            setErrorFor(confirmPassword, 'Password confirmation cannot be blank');
            valid = false;
        } else if (passwordValue !== confirmPasswordValue) {
            setErrorFor(confirmPassword, 'Passwords do not match');
            valid = false;
        } else {
            // Display success class
            setSuccessFor(confirmPassword);
        }

        // If form is valid, proceed with the registration request
        if (valid) {
            submitForm(usernameValue, emailValue, passwordValue);
        }
    }

    async function submitForm(username, email, password) {
        // Display loading gif
        document.getElementById("loading").style.display = "block";
        try {
            // Send a POST request to the registration endpoint with the form data
            const response = await fetch("/api/users/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indicate JSON content
                    'Accept': 'application/json' // Accept JSON responses
                },
                // Send form data as JSON
                body: JSON.stringify({
                    username:username, 
                    email: email,
                    password: password
                })
            });

            // Hide loading gif
            document.getElementById("loading").style.display = "none";

            if (response.ok) {
                // Dispaly success message
                document.getElementById("success-message").style.display = "block";
                // Redirect to the home page on successful login after 4 seconds
                setTimeout(() => {
                    window.location.href = '/home.html';
                }, 4000);
            } else {
                // Handle errors if registration fails
                const data = await response.json();
                alert(data.errors[0]?.msg || 'Unknown error');
            }
        } catch (error) {
            // Hide loading gif
            document.getElementById("loading").style.display = "none";
            // Handle network or unexpected errors
            console.error('Error during registration:', error);
            alert('An error occurred while registering.');
        }
    }

     // .form-control
    function setErrorFor(input, message) {
        const formControl = input.parentElement;
        const small = formControl.querySelector('small')

        // Add the error class
        formControl.className = 'form-control error';

        // Add error message inside small
        small.innerText = message;
    }

     // .form-control
    function setSuccessFor(input) {
        const formControl = input.parentElement;

        // Add the success class
        formControl.className = 'form-control success';
    }

    // Check if email is valid
    function validEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailPattern.test(email);
    }

    // Checks password strength
    function validPassword(password) {
        const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%])[A-Za-z\d@$!%]{8,}$/;
        return passwordPattern.test(password);
    } 
}