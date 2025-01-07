class AlphabetQuiz {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.currentQuestion = null;
    }

    generateQuestion() {
        const questionTypes = [
            this.generateNextLetterQuestion,
            this.generatePreviousLetterQuestion,
            this.generateMissingLetterQuestion,
            this.generateVowelConsonantQuestion,
        ];
        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        return randomType.call(this);
    }

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
            options: this.shuffleArray(allOptions),
            correctAnswers: correctAnswers,
        };
    }

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

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    displayQuestion() {
        this.currentQuestion = this.generateQuestion();
        document.getElementById('question').textContent = this.currentQuestion.question;
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        const isMultiSelect = Array.isArray(this.currentQuestion.correctAnswers);
        const selectedAnswers = new Set();

        this.currentQuestion.options.forEach((option) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option;
            button.onclick = () => {
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

        if (isMultiSelect) {
            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit';
            submitButton.className = 'start-button';
            submitButton.onclick = () => this.checkAnswer([...selectedAnswers]);
            optionsContainer.appendChild(submitButton);
        }
    }

    checkAnswer(selectedAnswers) {
        const buttons = document.querySelectorAll('.option-button');
        const correctAnswers = Array.isArray(this.currentQuestion.correctAnswers)
            ? this.currentQuestion.correctAnswers
            : [this.currentQuestion.correctAnswer];

        let isCorrect = correctAnswers.every((answer) => selectedAnswers.includes(answer)) &&
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
            this.score += 10;
            document.getElementById('score').textContent = this.score;
        }

        setTimeout(() => this.displayQuestion(), 1000);
    }

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

    async endQuiz() {
        clearInterval(this.timer);
        document.getElementById('quiz-screen').style.display = 'none';
        document.getElementById('result-screen').style.display = 'block';
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('time-taken').textContent = 60 - this.timeLeft;
    }
}

let quiz;

function startQuiz() {
    quiz = new AlphabetQuiz();
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    quiz.displayQuestion();
    quiz.startTimer();
}

function resetQuiz() {
    quiz = new AlphabetQuiz();
    quiz.reset();
}