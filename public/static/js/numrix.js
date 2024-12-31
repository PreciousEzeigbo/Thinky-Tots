// Puzzle 1: Uppercase and Lowercase Matching
const lowercaseDisplay = document.getElementById("lowercase-alphabets");
const timer = document.getElementById("time");
let timerInterval;
let puzzle1Complete = false;
let clickedUppercase = null;

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

// Function to disable all alphabet interactions
function disableInteractions() {
    const allBoxes = document.querySelectorAll(".box");
    allBoxes.forEach(box => {
        box.style.pointerEvents = "none";
    });
}

// Function to switch to Puzzle 2 after Puzzle 1 is completed
function switchToPuzzle2() {
    document.getElementById("puzzle-1").style.display = "none";
    document.getElementById("lowercase-alphabets").style.display = "none";
    document.getElementById("uppercase-alphabets").style.display = "none";
    document.getElementById("time").style.display = "none";
    document.getElementById("puzzle-2").style.display = "flex";
    document.getElementById("alphabets-order").style.display = "flex";
    document.getElementById("alphabets-displayed").style.display = "flex";
    document.getElementById("time").style.display = "flex";
    document.getElementById("time").style.justifyContent = "center";
}

// Function to switch to Puzzle 3 after Puzzle 2 is completed
function switchToPuzzle3() {
    document.getElementById("puzzle-2").style.display = "none";
    document.getElementById("alphabets-order").style.display = "none";
    document.getElementById("alphabets-displayed").style.display = "none";
    document.getElementById("time").style.display = "none";
    document.getElementById("puzzle-3").style.display = "flex";
    document.getElementById("alphas-order").style.display = "flex";
    document.getElementById("alphas-displayed").style.display = "flex";
    document.getElementById("time").style.display = "flex";
    document.getElementById("time").style.justifyContent = "center";
}


// Puzzle 1: Numerical Ordering
function setupPuzzle1() {
    const numbersDisplayed = document.getElementById("numbers-displayed");
    const numbersOrder = document.getElementById("numbers-order");
    const displayedBoxes = Array.from(numbersDisplayed.getElementsByClassName("box"));
    const orderBoxes = Array.from(numbersOrder.getElementsByClassName("box"));

    const shownNumbers = displayedBoxes.map(box => box.textContent);
    const correctOrder = [...shownNumbers].sort();

    let selectedIndex = 0;

    displayedBoxes.forEach(renderedNumbers => {
        renderedNumbers.addEventListener("click", function () {
            if (renderedNumbers.style.pointerEvents === "none") return;

            const number = renderedNumbers.textContent;

            if (number === correctOrder[selectedIndex]) {
                const correspondingOrderBox = document.getElementById("box-" + (selectedIndex + 1));
                correspondingOrderBox.textContent = renderedNumbers.textContent;
                renderedNumbers.style.pointerEvents = "none";
                correspondingOrderBox.style.backgroundColor = "lightgreen";
                renderedNumbers.style.backgroundColor = "lightgreen";
                selectedIndex++;
            } else {
                const correspondingOrderBox = document.getElementById("box-" + (selectedIndex + 1));
                correspondingOrderBox.textContent = "🙅‍♂️";
                correspondingOrderBox.style.backgroundColor = "red";
                renderedNumbers.style.backgroundColor = "red";

                displayedBoxes.forEach(box => box.style.pointerEvents = "none");

                setTimeout(() => {
                    correspondingOrderBox.textContent = "";
                    correspondingOrderBox.style.backgroundColor = "";
                    renderedNumbers.style.backgroundColor = "";

                    renderedNumbers.style.pointerEvents = "auto";
                    displayedBoxes.forEach(box => box.style.pointerEvents = "auto");
                }, 2000);
            }

            if ([...orderBoxes].every(box => box.textContent !== "")) {
                puzzle1Complete = true;
                setTimeout(() => switchToPuzzle2(), 1000);
            }
        });
    });
}

// DOM content loaded event
document.addEventListener("DOMContentLoaded", function () {
    startTimer(600);
    setupPuzzle1();
    setupPuzzle2();
    setupPuzzle3();
});
