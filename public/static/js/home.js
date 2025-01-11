// From Home.html

// Get the button element with the id "menu-button"
let menuBtn = document.getElementById("menu-button");
// Get the sidebar element using the class name "sidebar"
let sidebar = document.querySelector(".sidebar");
// Get the main container element using the class name "main-container"
let mainContainer = document.querySelector(".main-container");

// Function to toggle menu button
function menuButtonClicked() {
    sidebar.classList.toggle("active")
    mainContainer.classList.toggle("shift")
};


document.getElementById('logout').addEventListener('click', function(event) {
    event.preventDefault();
    // Call the logout function
    logoutUser();
});

// Function to handle logging out the user
function logoutUser() {
    fetch('/logout', { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            if (data.message && data.redirect_to) {
                // Show the logout message
                alert(data.message);
                // Redirect to the page received from the server (Login page)
                window.location.href = data.redirect_to;
            } else {
                alert("Logout failed, please try again.");
            }
        })
        .catch(error => {
            console.error('Error logging out:', error);
            alert("An error occurred while logging out.");
        }
    );
}
