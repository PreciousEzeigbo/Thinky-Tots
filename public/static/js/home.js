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