// DOM content must be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Get the boxes where uppercase and lowercase will be displayed
    const uppercaseDisplay = document.querySelector(".display-content1 .box-display");
    const lowercaseDisplay = document.querySelector(".display-content2 .box-display");

    // Get all the alphabet boxes (using querySelectorAll)
    const alphabetBoxes = document.querySelectorAll("#alphabets-display .box");

    // Go through each alphabet box one after the other
    alphabetBoxes.forEach(box => {
        box.addEventListener("click", function() {
            // Get the uppercase and lowercase alphabet from the clicked box
            const uppercaseAlphabets = box.querySelector(".uppercase").textContent;
            const lowercaseAlphabets = box.querySelector(".lowercase").textContent;

            // Update what is shown in the uppercase and lowercase alphabet boxes
            uppercaseDisplay.textContent = uppercaseAlphabets;
            lowercaseDisplay.textContent = lowercaseAlphabets;
        });
    });
});
