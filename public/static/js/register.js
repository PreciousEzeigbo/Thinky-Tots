document.getElementById('form').addEventListener('submit', (event) => {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    let valid = true;
// Username validation
if (!username) {
    setErrorFor('username', 'Username cannot be blank');
    valid = false;
} else if (username.length < 3) {
    setErrorFor('username', 'Username must be at least 3 characters');
    valid = false;
} else {
    setSuccessFor('username');
}

// Email validation
if (!email) {
    setErrorFor('email', 'Email cannot be blank');
    valid = false;
} else if (!validEmail(email)) {
    setErrorFor('email', 'Please enter a valid email address');
    valid = false;
} else {
    setSuccessFor('email');
}

// Password validation
if (!password) {
    setErrorFor('password', 'Password cannot be blank');
    valid = false;
} else if (!validPassword(password)) {
    setErrorFor('password', 'Password does not meet requirements');
    valid = false;
} else {
    setSuccessFor('password');
}

// Confirm password validation
if (!confirmPassword) {
    setErrorFor('confirmPassword', 'Please confirm your password');
    valid = false;
} else if (password !== confirmPassword) {
    setErrorFor('confirmPassword', 'Passwords do not match');
    valid = false;
} else {
    setSuccessFor('confirmPassword');
}

if (!valid) {
    event.preventDefault();
}
});

function setErrorFor(inputId, message) {
const formControl = document.getElementById(inputId).parentElement;
const small = formControl.querySelector('small');
formControl.className = 'form-control error';
small.innerText = message;
}

function setSuccessFor(inputId) {
const formControl = document.getElementById(inputId).parentElement;
formControl.className = 'form-control success';
}

function validEmail(email) {
return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

function validPassword(password) {
return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%])[A-Za-z\d@$!%]{8,}$/.test(password);
}