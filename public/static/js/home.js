let menuBtn = document.getElementById("menu-button");
let sidebar = document.querySelector(".sidebar");
let mainContainer = document.querySelector(".main-container");

function menuButtonClicked() {
    sidebar.classList.toggle("active")
    mainContainer.classList.toggle("shift")
};