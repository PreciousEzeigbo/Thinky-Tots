// The class represents the Alphabet Quiz functionality
class AlphabetQuiz {
    // The constructor initializes the quiz properties and sets up event listeners for buttons
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.currentQuestion = null;
        this.initialized = false;
        this.initializeEventListeners();
    }

    // Add event listeners to the buttons for the start, exit, and reset functionalities.
    initializeEventListeners() {
        if (this.initialized) return;
        
        // Start button to start the quiz
        document.getElementById('startButton').addEventListener('click', () => this.startQuiz());
        // Exit button to end the quiz and returns to the start screen
        document.getElementById('exitQuizButton').addEventListener('click', () => this.exitQuiz());
        // Play again button to reset the quiz
        document.getElementById('playAgainButton').addEventListener('click', () => this.reset());
        
        this.initialized = true;
    }

    // Reset the quiz state
    reset() {
        this.score = 0;
        this.timeLeft = 60;
        clearInterval(this.timer);
        this.timer = null;
        this.currentQuestion = null;

        // Reset the elements
        document.getElementById('score').textContent = '0';
        document.getElementById('timer').textContent = '60';
        document.getElementById('result-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        
        this.displayQuestion();
        this.startTimer();
    }

    // Start the quiz by hiding the start screen and showing the quiz screen
    startQuiz() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        this.displayQuestion();
        this.startTimer();
    }

    // Timer countdown
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            
            // If the timer reaches 0, the quiz ends
            if (this.timeLeft <= 0) {
                clearInterval(this.timer); // Stops the timer
                this.endQuiz(); // Ends the quiz
            }
        }, 1000);
    }
    
    // This method is called when the quiz time ends or the user manually ends the quiz
    endQuiz() {
        clearInterval(this.timer);
        document.getElementById('quiz-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.remove('hidden');
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('time-taken').textContent = 60 - this.timeLeft;
    }

    // Exits the quiz and returns to the start screen
    exitQuiz() {
        clearInterval(this.timer); // Stops the timer
        document.getElementById('quiz-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    }

    // Generates a random question from a list of question types
    generateQuestion() {
        // An array of functions that generate different types of questions
        const questionTypes = [
            this.generateNextLetterQuestion,
            this.generatePreviousLetterQuestion,
            this.generateMissingLetterQuestion,
            this.generateVowelConsonantQuestion,
        ];
        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        return randomType.call(this);
    }

    // Generates a question asking what letter comes after a given letter
    generateNextLetterQuestion() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomIndex = Math.floor(Math.random() * 25);
        const letter = alphabet[randomIndex];
        const correctAnswer = alphabet[randomIndex + 1];
        const options = this.generateOptions(correctAnswer);
        return {
            question: `What letter comes after ${letter}?`,
            options: options,
            correctAnswer: correctAnswer,
        };
    }

    // Generates a question asking what letter comes before a given letter
    generatePreviousLetterQuestion() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomIndex = Math.floor(Math.random() * 25) + 1;
        const letter = alphabet[randomIndex];
        const correctAnswer = alphabet[randomIndex - 1];
        const options = this.generateOptions(correctAnswer);
        return {
            question: `What letter comes before ${letter}?`,
            options: options,
            correctAnswer: correctAnswer,
        };
    }

    // Generates a question asking what letter goes between two others
    generateMissingLetterQuestion() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomIndex = Math.floor(Math.random() * 24) + 1;
        const before = alphabet[randomIndex - 1];
        const after = alphabet[randomIndex + 1];
        const correctAnswer = alphabet[randomIndex];
        const options = this.generateOptions(correctAnswer);
        return {
            question: `What letter goes between ${before} and ${after}?`,
            options: options,
            correctAnswer: correctAnswer,
        };
    }

    // Generates a question to select vowels or consonants
    generateVowelConsonantQuestion() {
        const vowels = 'AEIOU';
        const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
        const isVowelQuestion = Math.random() < 0.5;
        const numChoices = Math.floor(Math.random() * 3) + 3;
        let correctAnswers = [];
        let allOptions = [];

        // If the question is about vowels, pick a random vowel
        if (isVowelQuestion) {
            const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
            correctAnswers.push(randomVowel);
            allOptions.push(randomVowel);
        } else {
            const randomConsonant = consonants[Math.floor(Math.random() * consonants.length)];
            correctAnswers.push(randomConsonant);
            allOptions.push(randomConsonant);
        }

        // Add random letters to make the total options between 3-5
        while (allOptions.length < numChoices) {
            const isVowel = Math.random() < 0.3;
            const letter = isVowel
                ? vowels[Math.floor(Math.random() * vowels.length)] // Random vowel
                : consonants[Math.floor(Math.random() * consonants.length)]; // Random consonant
            if (!allOptions.includes(letter)) { // Avoid duplicate letters
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
            options: this.shuffleArray(allOptions),
            correctAnswers: correctAnswers,
        };
    }

    // Generates 4 answer options (with the correct one included)
    generateOptions(correctAnswer) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let options = [correctAnswer];
        while (options.length < 4) {
            const randomLetter = alphabet[Math.floor(Math.random() * 26)];
            if (!options.includes(randomLetter)) {
                options.push(randomLetter); // Avoid duplicate options
            }
        }
        return this.shuffleArray(options);
    }

    // Shuffles an array using Fisher-Yates algorithm
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray; // Return the shuffled array
    }

    // Displays the current question and its options on the screen
    displayQuestion() {
        this.currentQuestion = this.generateQuestion(); // Generates a new question
        document.getElementById('question').textContent = this.currentQuestion.question; // Displays the question
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = ''; // Clears previous options

        const isMultiSelect = Array.isArray(this.currentQuestion.correctAnswers); // Checks if multiple answers are allowed
        const selectedAnswers = new Set();

        // Create buttons for each option
        this.currentQuestion.options.forEach((option) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option;
            button.onclick = () => {
                // Handles the selection of an option
                if (isMultiSelect) {
                    if (selectedAnswers.has(option)) {
                        selectedAnswers.delete(option);
                        button.classList.remove('selected');
                    } else {
                        selectedAnswers.add(option);
                        button.classList.add('selected');
                    }
                } else {
                    this.checkAnswer([option]);
                }
            };
            optionsContainer.appendChild(button);
        });

        // If it's a multiselect question, create a submit button
        if (isMultiSelect) {
            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit';
            submitButton.className = 'submit-button';
            submitButton.onclick = () => this.checkAnswer([...selectedAnswers]);
            optionsContainer.appendChild(submitButton);
        }
    }

    // This method checks if the selected answers are correct
    checkAnswer(selectedAnswers) {
        const buttons = document.querySelectorAll('.option-button');
        const correctAnswers = Array.isArray(this.currentQuestion.correctAnswers)
            ? this.currentQuestion.correctAnswers
            : [this.currentQuestion.correctAnswer];

        // Checks if all selected answers are correct and vice versa
        const isCorrect = correctAnswers.every((answer) => selectedAnswers.includes(answer)) &&
            selectedAnswers.every((answer) => correctAnswers.includes(answer));

        // Updates button styles based on correctness
        buttons.forEach((button) => {
            button.disabled = true;
            if (correctAnswers.includes(button.textContent)) {
                button.classList.add('correct');
            } else if (selectedAnswers.includes(button.textContent)) {
                button.classList.add('incorrect');
            }
        });

        // If the answer is correct, increase the score
        if (isCorrect) {
            this.score += 10;
            document.getElementById('score').textContent = this.score; // Update score display
        }

        // Wait for 1 second before showing the next question
        setTimeout(() => this.displayQuestion(), 1000);
    }
}

// Initialize the quiz when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new AlphabetQuiz();
});
