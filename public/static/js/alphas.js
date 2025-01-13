// Constants
const GAME_DURATION = 60; // Game time in seconds
const POINTS_PER_QUESTION = 10;
const QUESTION_DISPLAY_TIME = 1000; // Time to show correct/incorrect answer before next question

// DOM Elements
const UI = {
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    question: document.getElementById('question'),
    options: document.getElementById('options'),
    screens: {
        quiz: document.getElementById('quiz-screen'),
        start: document.getElementById('start-screen'),
        result: document.getElementById('result-screen')
    },
    modal: {
        exit: document.getElementById('exitConfirmModal'),
        cancelExit: document.getElementById('cancelExit'),
        confirmExit: document.getElementById('confirmExit')
    },
    finalScore: document.getElementById('final-score'),
    timeTaken: document.getElementById('time-taken')
};

// Game State
const gameState = {
    currentQuestion: null,
    score: 0,
    timeLeft: GAME_DURATION,
    gameOver: false,
    questionsAnswered: 0,
    timer: null,
    selectedAnswers: new Set()
};

// Question Generation Functions
const questionGenerators = {
    // Function to generate "next letter" question
    generateNextLetterQuestion() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomIndex = Math.floor(Math.random() * 25);
        const letter = alphabet[randomIndex];
        const correctAnswer = alphabet[randomIndex + 1];
        const options = generateOptions(correctAnswer);
        return {
            question: `What letter comes after ${letter}?`,
            options: options,
            correctAnswer: correctAnswer,
            isMultiSelect: false
        };
    },

    // Function to generate "previous letter" question
    generatePreviousLetterQuestion() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomIndex = Math.floor(Math.random() * 25) + 1;
        const letter = alphabet[randomIndex];
        const correctAnswer = alphabet[randomIndex - 1];
        const options = generateOptions(correctAnswer);
        return {
            question: `What letter comes before ${letter}?`,
            options: options,
            correctAnswer: correctAnswer,
            isMultiSelect: false
        };
    },

    // Function to generate "missing letter" question
    generateMissingLetterQuestion() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomIndex = Math.floor(Math.random() * 24) + 1;
        const before = alphabet[randomIndex - 1];
        const after = alphabet[randomIndex + 1];
        const correctAnswer = alphabet[randomIndex];
        const options = generateOptions(correctAnswer);
        return {
            question: `What letter goes between ${before} and ${after}?`,
            options: options,
            correctAnswer: correctAnswer,
            isMultiSelect: false
        };
    },

    // Function to generate vowel/consonant identification question
    generateVowelConsonantQuestion() {
        const vowels = 'AEIOU';
        const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
        const isVowelQuestion = Math.random() < 0.5;
        const numChoices = Math.floor(Math.random() * 3) + 3;
        let correctAnswers = [];
        let allOptions = [];

        if (isVowelQuestion) {
            const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
            correctAnswers.push(randomVowel);
            allOptions.push(randomVowel);
        } else {
            const randomConsonant = consonants[Math.floor(Math.random() * consonants.length)];
            correctAnswers.push(randomConsonant);
            allOptions.push(randomConsonant);
        }

        while (allOptions.length < numChoices) {
            const isVowel = Math.random() < 0.3;
            const letter = isVowel
                ? vowels[Math.floor(Math.random() * vowels.length)]
                : consonants[Math.floor(Math.random() * consonants.length)];
            if (!allOptions.includes(letter)) {
                allOptions.push(letter);
                if (isVowelQuestion && isVowel) {
                    correctAnswers.push(letter);
                } else if (!isVowelQuestion && !isVowel) {
                    correctAnswers.push(letter);
                }
            }
        }

        return {
            question: `Select all the ${isVowelQuestion ? 'vowels' : 'consonants'}:`,
            options: shuffleArray(allOptions),
            correctAnswers: correctAnswers,
            isMultiSelect: true
        };
    }
};

// Function to generate answer options
function generateOptions(correctAnswer) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let options = [correctAnswer];
    while (options.length < 4) {
        const randomLetter = alphabet[Math.floor(Math.random() * 26)];
        if (!options.includes(randomLetter)) {
            options.push(randomLetter);
        }
    }
    return shuffleArray(options);
}

// Function to shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Function to format time as mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Function to generate a random question from available types
function generateQuestion() {
    const questionTypes = Object.values(questionGenerators);
    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    return randomType();
}

// Function to display the current question
function displayQuestion() {
    gameState.currentQuestion = generateQuestion();
    UI.question.textContent = gameState.currentQuestion.question;
    UI.options.innerHTML = '';
    gameState.selectedAnswers.clear();

    gameState.currentQuestion.options.forEach((option) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        button.onclick = () => handleOptionClick(button, option);
        UI.options.appendChild(button);
    });

    if (gameState.currentQuestion.isMultiSelect) {
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.className = 'submit-button';
        submitButton.onclick = () => checkAnswer([...gameState.selectedAnswers]);
        UI.options.appendChild(submitButton);
    }
}

function handleOptionClick(button, option) {
    if (gameState.currentQuestion.isMultiSelect) {
        if (gameState.selectedAnswers.has(option)) {
            gameState.selectedAnswers.delete(option);
            button.classList.remove('selected');
        } else {
            gameState.selectedAnswers.add(option);
            button.classList.add('selected');
        }
    } else {
        checkAnswer([option]);
    }
}

// Function to check the answer
function checkAnswer(selectedAnswers) {
    const buttons = document.querySelectorAll('.option-button');
    const correctAnswers = gameState.currentQuestion.isMultiSelect 
        ? gameState.currentQuestion.correctAnswers 
        : [gameState.currentQuestion.correctAnswer];

    const isCorrect = correctAnswers.every((answer) => selectedAnswers.includes(answer)) &&
        selectedAnswers.every((answer) => correctAnswers.includes(answer));

    buttons.forEach((button) => {
        button.disabled = true;
        if (correctAnswers.includes(button.textContent)) {
            button.classList.add('correct');
        } else if (selectedAnswers.includes(button.textContent)) {
            button.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        gameState.score += POINTS_PER_QUESTION;
        gameState.questionsAnswered++;
        UI.score.textContent = gameState.score;
    }

    setTimeout(displayQuestion, QUESTION_DISPLAY_TIME);
}

// Game Flow Functions

// Function to start the game
function startGame() {
    // Reset game state
    gameState.score = 0;
    gameState.timeLeft = GAME_DURATION;
    gameState.gameOver = false;
    gameState.questionsAnswered = 0;

    // Update UI
    UI.score.textContent = gameState.score;
    UI.timer.textContent = formatTime(gameState.timeLeft);

    // Show/hide screens
    UI.screens.start.classList.add('hidden');
    UI.screens.quiz.classList.remove('hidden');
    UI.screens.result.classList.add('hidden');

    displayQuestion();
    startTimer();
}

// Function to start the timer
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

    const timeTaken = GAME_DURATION - gameState.timeLeft;
    saveScore(timeTaken);

    UI.screens.quiz.classList.add('hidden');
    UI.screens.result.classList.remove('hidden');
    UI.finalScore.textContent = gameState.score;
    UI.timeTaken.textContent = timeTaken;
}

// Function to save the player's score to the server
async function saveScore() {
    try {
        // Send a POST request to save the score
        const response = await fetch('/api/alpha_scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                score: gameState.score,
                questionsAnswered: gameState.questionsAnswered,
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

// Modal Functions

// Function to show the exit confirmation modal
function showExitModal() {
    UI.modal.exit.classList.remove('hidden');
}

// Function to hide the exit confirmation modal
function hideExitModal() {
    UI.modal.exit.classList.add('hidden');
}

// Function to exit the quiz
function exitQuiz() {
    clearInterval(gameState.timer);
    UI.screens.quiz.classList.add('hidden');
    UI.screens.result.classList.add('hidden');
    UI.screens.start.classList.remove('hidden');
}

// Event Listeners
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('exitQuizButton').addEventListener('click', showExitModal);
document.getElementById('cancelExit').addEventListener('click', hideExitModal);
document.getElementById('confirmExit').addEventListener('click', () => {
    exitQuiz();
    hideExitModal();
});
document.getElementById('playAgainButton').addEventListener('click', startGame);