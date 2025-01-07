// Class for the alphabet quiz game
class AlphabetQuiz {
    constructor() {
        this.score = 0; // Initializes score to 0
        this.timeLeft = 60; // Sets the time for the quiz to 60 seconds
        this.timer = null;
        this.currentQuestion = null;
    }

    // Generates a random question by selecting from various types
    generateQuestion() {
        // List of different types of questions to be asked
        const questionTypes = [
            this.generateNextLetterQuestion,
            this.generatePreviousLetterQuestion,
            this.generateMissingLetterQuestion,
            this.generateVowelConsonantQuestion,
        ];
        // Randomly choose one of the question types
        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        // Call the chosen question generation method
        return randomType.call(this);
    }

    // Generates a question asking for the letter after a given letter
    generateNextLetterQuestion() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomIndex = Math.floor(Math.random() * 25);
        const letter = alphabet[randomIndex];
        const correctAnswer = alphabet[randomIndex + 1];
        const options = this.generateOptions(correctAnswer);
        return {
            question: `What letter comes after ${letter}?`,
            options: options, // Options
            correctAnswer: correctAnswer, // The correct answer
        };
    }

    // Generates a question asking for the letter before a given letter
    generatePreviousLetterQuestion() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomIndex = Math.floor(Math.random() * 25) + 1;
        const letter = alphabet[randomIndex];
        const correctAnswer = alphabet[randomIndex - 1];
        const options = this.generateOptions(correctAnswer);
        return {
            question: `What letter comes before ${letter}?`,
            options: options, // Options
            correctAnswer: correctAnswer, // The correct answer
        };
    }

    // Generates a question asking for the letter between two given letters
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

    // Generates a question asking for either vowels or consonants
    generateVowelConsonantQuestion() {
        const vowels = 'AEIOU';
        const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
        const isVowelQuestion = Math.random() < 0.5;
        const numChoices = Math.floor(Math.random() * 3) + 3;
        let correctAnswers = [];
        let allOptions = [];

        // If it's asking for vowels, randomly pick a vowel and add it to the correct answers
        if (isVowelQuestion) {
            const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
            correctAnswers.push(randomVowel);
            allOptions.push(randomVowel);
        } else {
            const randomConsonant = consonants[Math.floor(Math.random() * consonants.length)];
            correctAnswers.push(randomConsonant);
            allOptions.push(randomConsonant);
        }

        // Generate random options until we have the required number of choices
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

        // Return the question, options, and correct answers
        return {
            question: `Select all the ${isVowelQuestion ? 'vowels' : 'consonants'}:`,
            options: this.shuffleArray(allOptions),
            correctAnswers: correctAnswers,
        };
    }

    // Generate 4 options for the answers, with the correct answer included
    generateOptions(correctAnswer) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let options = [correctAnswer];
        while (options.length < 4) {
            const randomLetter = alphabet[Math.floor(Math.random() * 26)];
            if (!options.includes(randomLetter)) {
                options.push(randomLetter);
            }
        }
        return this.shuffleArray(options);
    }

    // Shuffle the answer options randomly
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array; // Return the shuffled array
    }

    // Display the current question and options on the screen
    displayQuestion() {
        this.currentQuestion = this.generateQuestion();
        document.getElementById('question').textContent = this.currentQuestion.question;
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        // Check if it's a multi-select question
        const isMultiSelect = Array.isArray(this.currentQuestion.correctAnswers);
        const selectedAnswers = new Set();

        // Create buttons for each answer option
        this.currentQuestion.options.forEach((option) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option;
            button.onclick = () => {
                if (isMultiSelect) {
                    // Toggle the selection for multi-select questions
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

        // If it's a multi-select question, add a submit button
        if (isMultiSelect) {
            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit';
            submitButton.className = 'start-button';
            submitButton.onclick = () => this.checkAnswer([...selectedAnswers]);
            optionsContainer.appendChild(submitButton);
        }
    }

    // Check if the selected answers are correct
    checkAnswer(selectedAnswers) {
        const buttons = document.querySelectorAll('.option-button');
        const correctAnswers = Array.isArray(this.currentQuestion.correctAnswers)
            ? this.currentQuestion.correctAnswers
            : [this.currentQuestion.correctAnswer];

        // Check if all selected answers match the correct answers
        let isCorrect = correctAnswers.every((answer) => selectedAnswers.includes(answer)) &&
            selectedAnswers.every((answer) => correctAnswers.includes(answer));

        // Highlight the buttons as correct or incorrect
        buttons.forEach((button) => {
            button.disabled = true;
            if (correctAnswers.includes(button.textContent)) {
                button.classList.add('correct');
            } else if (selectedAnswers.includes(button.textContent)) {
                button.classList.add('incorrect');
            }
        });

        // If the answer is correct, add 10 points to the score
        if (isCorrect) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
        }
        // Display a new question after 1 second
        setTimeout(() => this.displayQuestion(), 1000);
    }

    // Start the countdown timer
    startTimer() {
        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                document.getElementById('timer').textContent = this.timeLeft;
            } else {
                this.endQuiz();
            }
        }, 1000);
    }

    // End the quiz and show the final result
    async endQuiz() {
        clearInterval(this.timer);
        document.getElementById('quiz-screen').style.display = 'none';
        document.getElementById('result-screen').style.display = 'block';
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('time-taken').textContent = 60 - this.timeLeft;
    }
}

let quiz;

// Function to start the quiz
function startQuiz() {
    quiz = new AlphabetQuiz();
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    quiz.displayQuestion();
    quiz.startTimer();
}

// Function to reset the quiz
function resetQuiz() {
    quiz = new AlphabetQuiz();
    quiz.reset();
}