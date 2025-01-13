// Constants
const GAME_DURATION = 600; // Game time in seconds (10 minutes)
const MAX_DIFFICULTY = 4;
const QUESTIONS_PER_LEVEL = 3;
const POINTS_MULTIPLIER = 10;

// DOM Elements
const UI = {
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    level: document.getElementById('level'),
    question: document.getElementById('question'),
    form: document.getElementById('answerForm'),
    input: document.getElementById('answerInput'),
    feedback: document.getElementById('feedback'),
    screens: {
        game: document.getElementById('gameContent'),
        gameOver: document.getElementById('gameOver')
    },
    modal: {
        exit: document.getElementById('exitConfirmModal')
    },
    results: {
        finalScore: document.getElementById('finalScore'),
        questionsAnswered: document.getElementById('questionsAnswered')
    }
};

// Game State
const gameState = {
    currentQuestion: null,
    score: 0,
    difficulty: 1,
    timeLeft: GAME_DURATION,
    gameOver: false,
    questionsAnswered: 0,
    timer: null
};

// Math Generation Functions
const mathGenerators = {
    // Function to generate a random number based on difficulty
    getRandomNumber(difficulty) {
        const max = Math.pow(10, difficulty);
        return Math.floor(Math.random() * max);
    },

    // Function to generate a random math question based on difficulty level
    generateQuestion(diff) {
        const num1 = this.getRandomNumber(diff);
        const num2 = this.getRandomNumber(diff);
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
};

// Utility Functions

// Function to format time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Function to display feedback if correct or incorrect answers
function showFeedback(message, type) {
    UI.feedback.textContent = message;
    UI.feedback.className = `feedback-message feedback-${type}`;
    setTimeout(() => {
        UI.feedback.className = 'feedback-message hidden';
    }, 2000);
}

// API Functions

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
                score: gameState.score,
                questionsAnswered: gameState.questionsAnswered,
                maxDifficulty: gameState.difficulty,
                timeLeft: gameState.timeLeft
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save score'); // Handle error if the request fails
        }
    } catch (error) {
        console.error('Error saving score:', error); // Log error to console
    }
}

// Game Flow Functions

// Function to start a new game
function startGame() {
    // Reset game state
    gameState.score = 0;
    gameState.difficulty = 1;
    gameState.timeLeft = GAME_DURATION;
    gameState.gameOver = false;
    gameState.questionsAnswered = 0;
    
    // Update the UI with initial values
    UI.score.textContent = gameState.score;
    UI.level.textContent = gameState.difficulty;
    gameState.currentQuestion = mathGenerators.generateQuestion(gameState.difficulty);
    UI.question.textContent = gameState.currentQuestion.question;
    
    // Show the game content and hide the game over screen
    UI.screens.game.classList.remove('hidden');
    UI.screens.gameOver.classList.add('hidden');
    
    startTimer(); // Start the timer
}

// Function to start the countdown timer
function startTimer() {
    if (gameState.timer) clearInterval(gameState.timer);
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        UI.timer.textContent = formatTime(gameState.timeLeft);
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Function to end the game
function endGame() {
    gameState.gameOver = true;
    clearInterval(gameState.timer);
    saveScore();
    
    // Show game over screen and display final score
    UI.screens.game.classList.add('hidden');
    UI.screens.gameOver.classList.remove('hidden');
    UI.results.finalScore.textContent = gameState.score;
    UI.results.questionsAnswered.textContent = gameState.questionsAnswered;
}

// Handle the answer submission
function handleAnswer(e) {
    e.preventDefault(); // Prevent the form from refreshing the page

    if (gameState.gameOver) return; // Prevent answering after game over
    
    const userAnswer = parseInt(UI.input.value); // Get the users answer
    const isCorrect = userAnswer === gameState.currentQuestion.answer; // Check if the answer is correct
    
    if (isCorrect) {
        gameState.score += gameState.difficulty * POINTS_MULTIPLIER; // Award score based on difficulty
        gameState.questionsAnswered++; // Increase number of answered questions
        UI.score.textContent = gameState.score;
        showFeedback('Correct! Well done!', 'success');
        
        // Increase difficulty every QUESTIONS_PER_LEVEL questions
        if (gameState.questionsAnswered > 0 && gameState.questionsAnswered % QUESTIONS_PER_LEVEL === 0) {
            gameState.difficulty = Math.min(gameState.difficulty + 1, MAX_DIFFICULTY);
            UI.level.textContent = gameState.difficulty;
        }
    } else {
        showFeedback(`Incorrect. The answer was ${gameState.currentQuestion.answer}`, 'error'); // Show error message
    }
    
    // Generate the next question and update the display
    gameState.currentQuestion = mathGenerators.generateQuestion(gameState.difficulty);
    UI.question.textContent = gameState.currentQuestion.question;
    UI.input.value = '';
}

// Handle the exit button
function handleExit() {
    if (gameState.score > 0 || gameState.questionsAnswered > 0) {
        UI.modal.exit.classList.remove('hidden');
    } else {
        window.location.href = '/home'; // Go back to dashboard
    }
}

function hideExitModal() {
    UI.modal.exit.classList.add('hidden');
}

function navigateToHome() {
    window.location.href = '/home'; // Go back to dashboard
}

// Event Listeners
UI.form.addEventListener('submit', handleAnswer);
document.getElementById('exitButton').addEventListener('click', handleExit);
document.getElementById('cancelExit').addEventListener('click', hideExitModal);
document.getElementById('confirmExit').addEventListener('click', navigateToHome);
document.getElementById('exitToHome').addEventListener('click', navigateToHome);
document.getElementById('playAgain').addEventListener('click', startGame);

// Start the game automatically when the page is loaded
startGame(); // Begin the game