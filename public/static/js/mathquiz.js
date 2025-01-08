// Game state
let currentQuestion = null;
let score = 0;
let difficulty = 1;
let timeLeft = 600;
let gameOver = false;
let questionsAnswered = 0;
let timer = null;

// DOM Elements
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

// Helper Functions
function getRandomNumber(difficulty) {
    const max = Math.pow(10, difficulty);
    return Math.floor(Math.random() * max);
}

function generateQuestion(diff) {
    const num1 = getRandomNumber(diff);
    const num2 = getRandomNumber(diff);
    const operations = ['+', '-', '×', '÷'];
    let operation = operations[Math.floor(Math.random() * operations.length)];
    
    if (operation === '÷') {
        const product = num1 * num2;
        return {
            question: `${product} ÷ ${num1}`,
            answer: num2
        };
    }
    
    let answer;
    switch (operation) {
        case '+': answer = num1 + num2; break;
        case '-': answer = num1 - num2; break;
        case '×': answer = num1 * num2; break;
        default: answer = num1;
    }
    
    return {
        question: `${num1} ${operation} ${num2}`,
        answer: answer
    };
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showFeedback(message, type) {
    feedbackElement.textContent = message;
    feedbackElement.className = `feedback-message feedback-${type}`;
    setTimeout(() => {
        feedbackElement.className = 'feedback-message hidden';
    }, 2000);
}

async function saveScore() {
    try {
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
            throw new Error('Failed to save score');
        }
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

// Game Logic
function startGame() {
    score = 0;
    difficulty = 1;
    timeLeft = 600;
    gameOver = false;
    questionsAnswered = 0;
    
    scoreElement.textContent = score;
    levelElement.textContent = difficulty;
    currentQuestion = generateQuestion(difficulty);
    questionElement.textContent = currentQuestion.question;
    
    gameContent.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    
    startTimer();
}

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

function endGame() {
    gameOver = true;
    clearInterval(timer);
    saveScore();
    
    gameContent.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
    questionsAnsweredElement.textContent = questionsAnswered;
}

// Event Handlers
answerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userAnswer = parseInt(answerInput.value);
    const isCorrect = userAnswer === currentQuestion.answer;
    
    if (isCorrect) {
        score += difficulty * 10;
        questionsAnswered++;
        scoreElement.textContent = score;
        showFeedback('Correct! Well done!', 'success');
        
        if (questionsAnswered > 0 && questionsAnswered % 3 === 0) {
            difficulty = Math.min(difficulty + 1, 4);
            levelElement.textContent = difficulty;
        }
    } else {
        showFeedback(`Incorrect. The answer was ${currentQuestion.answer}`, 'error');
    }
    
    currentQuestion = generateQuestion(difficulty);
    questionElement.textContent = currentQuestion.question;
    answerInput.value = '';
});

document.getElementById('exitButton').addEventListener('click', () => {
    if (score > 0 || questionsAnswered > 0) {
        exitConfirmModal.classList.remove('hidden');
    } else {
        window.location.href = '/home';
    }
});

document.getElementById('cancelExit').addEventListener('click', () => {
    exitConfirmModal.classList.add('hidden');
});

document.getElementById('confirmExit').addEventListener('click', () => {
    window.location.href = '/home';
});

document.getElementById('exitToHome').addEventListener('click', () => {
    window.location.href = '/home';
});

document.getElementById('playAgain').addEventListener('click', startGame);

// Start the game when the page loads
startGame();