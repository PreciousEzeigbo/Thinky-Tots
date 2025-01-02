// Puzzle 1: Uppercase and Lowercase Matching
const lowercaseDisplay = document.getElementById("lowercase-alphabets");
const timer = document.getElementById("time");
const scoreUpdate = document.getElementById("score");
const quitButton = document.getElementById("quitButton");
let timerInterval;
let puzzle1Complete = false;
let puzzle2Complete = false;
let clickedUppercase = null;

let score = 0;

// Function to shuffle lowercase letters for puzzle 1
function shuffleLowercase() {
    const boxes = Array.from(lowercaseDisplay.getElementsByClassName("box"));
    for (let a = boxes.length - 1; a > 0; a--) {
        const b = Math.floor(Math.random() * (a + 1));
        [boxes[a], boxes[b]] = [boxes[b], boxes[a]];
    }
    boxes.forEach(box => lowercaseDisplay.appendChild(box));
}

// Timer function
function startTimer(duration) {
    let timeLeft = duration;
    timerInterval = setInterval(function () {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            disableInteractions();
            alert("Time is up! You didn't finish the game.");
        } else {
            timeLeft--;
        }
    }, 1000);
}

// Function to quit puzzle
function toQuit() {
    // Ask user before quitting puzzle
    const confirmQuit = confirm("Are you sure you want to quit the puzzle?");
    if (confirmQuit) {
        // Stop the timer
        clearInterval(timerInterval);

        // Disable all alphabet interactions
        disableInteractions();

        // Optionally, show a message to indicate the game is paused or quit
        alert("You have quit the game. Your progress will be lost.");

        // Redirect to home.html after quitting
        window.location.href = "/home";
    }
}

// Function to disable all alphabet interactions
function disableInteractions() {
    const allBoxes = document.querySelectorAll(".box");
    allBoxes.forEach(box => {
        box.style.pointerEvents = "none";
    });
}

// Function to Display score
function updateScore() {
    scoreUpdate.textContent = "Score: " + score;
}

// Function to switch to Puzzle 2 after Puzzle 1 is completed
function switchToPuzzle2() {
    document.getElementById("puzzle-1").style.display = "none";
    document.getElementById("lowercase-alphabets").style.display = "none";
    document.getElementById("uppercase-alphabets").style.display = "none";
    document.getElementById("time").style.display = "none";
    document.getElementById("rules-1").style.display = "none";
    document.getElementById("puzzle-2").style.display = "flex";
    document.getElementById("alphabets-order").style.display = "flex";
    document.getElementById("alphabets-displayed").style.display = "flex";
    document.getElementById("time").style.display = "flex";
    document.getElementById("time").style.justifyContent = "center";
    document.getElementById("rules-2").style.display = "flex";
}

// Function to switch to Puzzle 3 after Puzzle 2 is completed
function switchToPuzzle3() {
    document.getElementById("puzzle-2").style.display = "none";
    document.getElementById("alphabets-order").style.display = "none";
    document.getElementById("alphabets-displayed").style.display = "none";
    document.getElementById("time").style.display = "none";
    document.getElementById("rules-2").style.display = "none";
    document.getElementById("puzzle-3").style.display = "flex";
    document.getElementById("alphas-order").style.display = "flex";
    document.getElementById("alphas-displayed").style.display = "flex";
    document.getElementById("time").style.display = "flex";
    document.getElementById("time").style.justifyContent = "center";
    document.getElementById("rules-3").style.display = "flex";
}

// Puzzle 1: Uppercase and Lowercase Matching Logic
function setupPuzzle1() {
    const uppercaseBoxes = document.querySelectorAll("#uppercase-alphabets .box");
    const lowercaseBoxes = document.querySelectorAll("#lowercase-alphabets .box");

    uppercaseBoxes.forEach(uppercaseBox => {
        uppercaseBox.addEventListener("click", function () {
            if (clickedUppercase !== null) return;

            uppercaseBox.style.backgroundColor = "yellow";
            clickedUppercase = uppercaseBox;
        });
    });

    lowercaseBoxes.forEach(lowercaseBox => {
        lowercaseBox.addEventListener("click", function () {
            if (clickedUppercase === null) return;

            const uppercaseAlphabets = clickedUppercase.textContent;
            const lowercaseAlphabets = lowercaseBox.textContent;

            if (uppercaseAlphabets.toLowerCase() === lowercaseAlphabets) {
                lowercaseBox.style.backgroundColor = "green";
                clickedUppercase.style.backgroundColor = "green";
                clickedUppercase.style.pointerEvents = "none";
                lowercaseBox.style.pointerEvents = "none";
                clickedUppercase = null;

                // Correct match to add 2 points
                score += 2;
                updateScore();
            } else {
                lowercaseBox.style.backgroundColor = "red";
                setTimeout(function () {
                    lowercaseBox.style.backgroundColor = "";
                    clickedUppercase.style.backgroundColor = "";
                    clickedUppercase = null;
                }, 2000);

                // Incorrect match to deduct 2 points
                score -= 2;
                updateScore();
            }

            // Check if all pairs are correct
            if ([...uppercaseBoxes].every(box => box.style.backgroundColor === "green") &&
                [...lowercaseBoxes].every(box => box.style.backgroundColor === "green")) {
                puzzle1Complete = true;
                setTimeout(() => switchToPuzzle2(), 1000);
            }
        });
    });
};


// Puzzle 2: Alphabetical Ordering
function setupPuzzle2() {
    const alphabetsDisplayed = document.getElementById("alphabets-displayed");
    const alphabetsOrder = document.getElementById("alphabets-order");
    const displayedBoxes = Array.from(alphabetsDisplayed.getElementsByClassName("box"));
    const orderBoxes = Array.from(alphabetsOrder.getElementsByClassName("box"));

    const shownAlphabets = displayedBoxes.map(box => box.textContent);
    const correctOrder = [...shownAlphabets].sort();

    let selectedIndex = 0;

    displayedBoxes.forEach(renderedAlphabets => {
        renderedAlphabets.addEventListener("click", function () {
            if (renderedAlphabets.style.pointerEvents === "none") return;

            const alphabet = renderedAlphabets.textContent;

            if (alphabet === correctOrder[selectedIndex]) {
                const correspondingOrderBox = document.getElementById("box-" + (selectedIndex + 1));
                correspondingOrderBox.textContent = renderedAlphabets.textContent;
                renderedAlphabets.style.pointerEvents = "none";
                correspondingOrderBox.style.backgroundColor = "lightgreen";
                renderedAlphabets.style.backgroundColor = "lightgreen";
                selectedIndex++;

                // Correct match to add 5 points
                score += 5;
                updateScore();
            } else {
                const correspondingOrderBox = document.getElementById("box-" + (selectedIndex + 1));
                correspondingOrderBox.textContent = "🙅‍♂️";
                correspondingOrderBox.style.backgroundColor = "red";
                renderedAlphabets.style.backgroundColor = "red";

                displayedBoxes.forEach(box => box.style.pointerEvents = "none");

                setTimeout(() => {
                    correspondingOrderBox.textContent = "";
                    correspondingOrderBox.style.backgroundColor = "";
                    renderedAlphabets.style.backgroundColor = "";

                    renderedAlphabets.style.pointerEvents = "auto";
                    displayedBoxes.forEach(box => box.style.pointerEvents = "auto");
                }, 2000);

                // Incorrect match to deduct 3 points
                score -= 3;
                updateScore();
            }

            if ([...orderBoxes].every(box => box.textContent !== "")) {
                puzzle2Complete = true;
                setTimeout(() => switchToPuzzle3(), 1000);
            }
        });
    });
}


// Puzzle 3: Unscramble the Alphabets
function setupPuzzle3() {
    const alphasDisplayed = document.getElementById("alphas-displayed");
    const alphasOrder = document.getElementById("alphas-order");
    const displayedItems = Array.from(alphasDisplayed.getElementsByClassName("item"));
    const orderItems = Array.from(alphasOrder.getElementsByClassName("item"));

    const shownAlphas = displayedItems.map(item => item.textContent);
    const alphabeticalOrder = [...shownAlphas].sort();

    let currentIndex = 0;

    displayedItems.forEach(renderedAlphas => {
        renderedAlphas.addEventListener("click", function () {
            if (renderedAlphas.style.pointerEvents === "none") return;

            const alpha = renderedAlphas.textContent;

            if (alpha === alphabeticalOrder[currentIndex]) {
                const correspondingOrderItem = document.getElementById("item-" + (currentIndex + 1));
                correspondingOrderItem.textContent = renderedAlphas.textContent;
                renderedAlphas.style.pointerEvents = "none";
                correspondingOrderItem.style.backgroundColor = "green";
                renderedAlphas.style.backgroundColor = "green";
                currentIndex++;

                // Correct match to add 8 points
                score += 8;
                updateScore();
            } else {
                const correspondingOrderItem = document.getElementById("item-" + (currentIndex + 1));
                correspondingOrderItem.textContent = "🙅‍♀️";
                correspondingOrderItem.style.backgroundColor = "red";
                renderedAlphas.style.backgroundColor = "red";

                displayedItems.forEach(item => item.style.pointerEvents = "none");

                setTimeout(() => {
                    correspondingOrderItem.textContent = "";
                    correspondingOrderItem.style.backgroundColor = "";
                    renderedAlphas.style.backgroundColor = "";

                    renderedAlphas.style.pointerEvents = "auto";
                    displayedItems.forEach(box => box.style.pointerEvents = "auto");
                }, 1500);

                // Incorrect match to deduct 4 points
                score -= 4;
                updateScore();
            }

            if ([...orderItems].every(box => box.textContent !== "")) {
                alert("Puzzle is complete!");
                disableInteractions();
            }
        });
    });
}



// DOM content loaded event
document.addEventListener("DOMContentLoaded", function () {
    startTimer(1200);
    shuffleLowercase();
    setupPuzzle1();
    setupPuzzle2();
    setupPuzzle3();

    // Event listener for quit button
    quitButton.addEventListener("click", toQuit);
});
