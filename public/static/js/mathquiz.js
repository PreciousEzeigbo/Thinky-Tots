// Variables to track the game's progress and state
let currentQuestion = null;
let score = 0;
let difficulty = 1;
let timeLeft = 600;
let gameOver = false;
let questionsAnswered = 0;
let timer = null;

// Select DOM elements for displaying the game UI
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const questionElement = document.getElementById('question');
const answerForm = document.getElementById('answerForm');
const answerInput = document.getElementById('answerInput');
const feedbackElement = document.getElementById('feedback');
const gameContent = document.getElementById('gameContent');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const questionsAnsweredElement = document.getElementById('questionsAnswered');
const exitConfirmModal = document.getElementById('exitConfirmModal');

// Function to generate a random number based on difficulty
function getRandomNumber(difficulty) {
    const max = Math.pow(10, difficulty);
    return Math.floor(Math.random() * max);
}

// Function to generate a random math question based on difficulty level
function generateQuestion(diff) {
    const num1 = getRandomNumber(diff);
    const num2 = getRandomNumber(diff);
    const operations = ['+', '-', '×', '÷'];
    let operation = operations[Math.floor(Math.random() * operations.length)];
    
    // Handle division separately to avoid fractions
    if (operation === '÷') {
        const product = num1 * num2;
        return {
            question: `${product} ÷ ${num1}`,
            answer: num2
        };
    }
    
    let answer;
    switch (operation) {
        case '+': answer = num1 + num2; break; // Addition
        case '-': answer = num1 - num2; break; // Subtraction
        case '×': answer = num1 * num2; break; // Multiplication
        default: answer = num1; // Fallback should not happen
    }
    
    return {
        question: `${num1} ${operation} ${num2}`,
        answer: answer
    };
}

// Function to format time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Function to display feedback if correct or incorrect answers
function showFeedback(message, type) {
    feedbackElement.textContent = message;
    feedbackElement.className = `feedback-message feedback-${type}`;
    setTimeout(() => {
        feedbackElement.className = 'feedback-message hidden';
    }, 2000);
}

// Function to save the player's score to the server
async function saveScore() {
    try {
        // Send a POST request to save the score
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                score,
                questionsAnswered,
                maxDifficulty: difficulty,
                timeLeft
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save score'); // Handle error if the request fails
        }
    } catch (error) {
        console.error('Error saving score:', error); // Log error to console
    }
}

// Game Logic Functions

// Function to start a new game
function startGame() {
    // Reset all game state variables
    score = 0;
    difficulty = 1;
    timeLeft = 600;
    gameOver = false;
    questionsAnswered = 0;
    
    // Update the UI with initial values
    scoreElement.textContent = score;
    levelElement.textContent = difficulty;
    currentQuestion = generateQuestion(difficulty);
    questionElement.textContent = currentQuestion.question;
    
    // Show the game content and hide the game over screen
    gameContent.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    
    startTimer(); // Start the timer
}

// Function to start the countdown timer
function startTimer() {
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = formatTime(timeLeft);
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Function to end the game
function endGame() {
    gameOver = true;
    clearInterval(timer);
    saveScore();
    
    // Show game over screen and display final score
    gameContent.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
    questionsAnsweredElement.textContent = questionsAnswered;
}

// Event Handlers

// Handle the answer submission
answerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page
    
    const userAnswer = parseInt(answerInput.value); // Get the users answer
    const isCorrect = userAnswer === currentQuestion.answer; // Check if the answer is correct
    
    if (isCorrect) {
        score += difficulty * 10; // Award score based on difficulty
        questionsAnswered++; // Increase number of answered questions
        scoreElement.textContent = score;
        showFeedback('Correct! Well done!', 'success');
        
        // Increase difficulty every 3 questions answered
        if (questionsAnswered > 0 && questionsAnswered % 3 === 0) {
            difficulty = Math.min(difficulty + 1, 4);
            levelElement.textContent = difficulty;
        }
    } else {
        showFeedback(`Incorrect. The answer was ${currentQuestion.answer}`, 'error'); // Show error message
    }
    
    // Generate the next question and update the display
    currentQuestion = generateQuestion(difficulty);
    questionElement.textContent = currentQuestion.question;
    answerInput.value = '';
});

// Handle the exit button
document.getElementById('exitButton').addEventListener('click', () => {
    if (score > 0 || questionsAnswered > 0) {
        exitConfirmModal.classList.remove('hidden');
    } else {
        window.location.href = '/home';
    }
});

// Handle canceling exit confirmation
document.getElementById('cancelExit').addEventListener('click', () => {
    exitConfirmModal.classList.add('hidden');
});

// Handle confirming exit and going back to dashboard
document.getElementById('confirmExit').addEventListener('click', () => {
    window.location.href = '/home'; // Go back to dashboard
});

// Handle going back to dashboard from the exit modal
document.getElementById('exitToHome').addEventListener('click', () => {
    window.location.href = '/home'; // Redirect to dashboard
});

// Handle restarting the game
document.getElementById('playAgain').addEventListener('click', startGame); // Start a new game

// Start the game automatically when the page is loaded
startGame(); // Begin the game
