// MathQuiz Component Definition
const MathQuiz = () => {
    // Declaring variables that store the state of the game
    const [currentQuestion, setCurrentQuestion] = React.useState(null);
    const [userAnswer, setUserAnswer] = React.useState('');
    const [score, setScore] = React.useState(0);
    const [difficulty, setDifficulty] = React.useState(1);
    const [timeLeft, setTimeLeft] = React.useState(600);
    const [gameOver, setGameOver] = React.useState(false);
    const [feedback, setFeedback] = React.useState(null);
    const [questionsAnswered, setQuestionsAnswered] = React.useState(0);
    const [showExitConfirm, setShowExitConfirm] = React.useState(false);

    // Function to handle when the user wants to exit the quiz
    const handleExit = () => {
        // Show confirmation if the user has made progress i.e score > 0 or answered questions
        if (score > 0 || questionsAnswered > 0) {
            setShowExitConfirm(true);
        } else {
            // If no progress has been made, exit directly to dashboard page
            window.location.href = HOME_URL;
        }
    };
    // If the user confirms the exit, they are taken to the dashboard page
    const confirmExit = () => {
        window.location.href = HOME_URL;
    };

    // Generates a random number based on the difficulty level
    const getRandomNumber = (difficulty) => {
        const max = Math.pow(10, difficulty);
        return Math.floor(Math.random() * max);
    };
    // Save user's score after the game ends
    const saveScore = async () => {
        try {
            // Sends the score data to the server using a POST request
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
            
            // Handles error if the request was unsuccessful
            if (!response.ok) {
                throw new Error('Failed to save score');
            }
        } catch (error) {
            console.error('Error saving score:', error);
        }
    };

    // Generates a random math question based on the difficulty level
    const generateQuestion = (diff) => {
        const num1 = getRandomNumber(diff);
        const num2 = getRandomNumber(diff);
        const operations = ['+', '-', '×', '÷'];
        let operation = operations[Math.floor(Math.random() * operations.length)];
        
        // Special handling for division to ensure whole number results
        if (operation === '÷') {
            const product = num1 * num2;
            return {
                question: `${product} ÷ ${num1}`,
                answer: num2
            };
        }
        
        let answer;
        // Based on the operation, calculate the correct answer
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
    };

    // useEffect to generate a new question whenever the difficulty changes
    React.useEffect(() => {
        setCurrentQuestion(generateQuestion(difficulty));
    }, [difficulty]);

    // Timer to decrease time left every second and check if the game is over
    React.useEffect(() => {
        if (timeLeft > 0 && !gameOver) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setGameOver(true);
            saveScore();  //Save score when game ends
        }
    }, [timeLeft, gameOver]);

    // Handles the submission of the user's answer
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Checks if the answer is correct
        const isCorrect = parseInt(userAnswer) === currentQuestion.answer;
        
        if (isCorrect) {
            setScore(prev => prev + difficulty * 10);
            setQuestionsAnswered(prev => prev + 1);
            setFeedback({
                type: 'success',
                message: 'Correct! Well done!'
            });
            
            // Increases difficulty after every 3 correct answers
            if (questionsAnswered > 0 && (questionsAnswered + 1) % 3 === 0) {
                setDifficulty(prev => Math.min(prev + 1, 4));
            }
        } else {
            setFeedback({
                type: 'error',
                message: `Incorrect. The answer was ${currentQuestion.answer}`
            });
        }
        
        // Generate a new question after answering
        setCurrentQuestion(generateQuestion(difficulty));
        setUserAnswer('');
        
        // Clears feedback after 2 seconds
        setTimeout(() => setFeedback(null), 2000);
    };

    // Format the time left
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Confirmation modal when the user tries to exit the quiz
    const ExitConfirmationModal = () => (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3 className="text-lg font-bold mb-4">Exit Quiz?</h3>
                <p className="mb-4">Are you sure you want to exit? Your progress will be lost.</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setShowExitConfirm(false)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmExit}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );

    // Game over screen with options to show final score and options to replay or exit
    const GameOverScreen = () => (
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <p className="text-xl">Final Score: {score}</p>
            <p>Questions Answered: {questionsAnswered}</p>
            <div className="space-x-4">
                <button
                    onClick={() => {
                        setGameOver(false);
                        setScore(0);
                        setDifficulty(1);
                        setTimeLeft(600);
                        setQuestionsAnswered(0);
                        setCurrentQuestion(generateQuestion(1));
                    }}
                    className="p-3 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                    Play Again
                </button>
                <button
                    onClick={confirmExit}
                    className="p-3 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                    Exit to Home
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-lg mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">Math Quiz</div>
                <div className="flex items-center gap-4">
                    <span className="font-mono">{formatTime(timeLeft)}</span>
                    <button
                        onClick={handleExit}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        Exit Quiz
                    </button>
                </div>
            </div>

            {showExitConfirm && <ExitConfirmationModal />}

            <div className="flex justify-between items-center">
                <div className="text-lg">Score: {score}</div>
                <div className="text-lg">Level: {difficulty}</div>
            </div>

            {!gameOver ? (
                <div className="space-y-4">
                    <div className="math-question">
                        {currentQuestion?.question}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="number"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="w-full p-3 text-lg border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your answer"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            Submit Answer
                        </button>
                    </form>

                    {feedback && (
                        <div className={`feedback-message ${feedback.type === 'success' ? 'feedback-success' : 'feedback-error'}`}>
                            {feedback.message}
                        </div>
                    )}
                </div>
            ) : (
                <GameOverScreen />
            )}

            <div className="rules-container">
                <h3 className="font-bold">Rules</h3>
                <ul className="list-disc ml-5 mt-2">
                    <li>Solve math problems within 10 minutes</li>
                    <li>Difficulty increases every 3 correct answers</li>
                    <li>Score more points at higher difficulty levels</li>
                    <li>All answers are whole numbers</li>
                </ul>
            </div>
        </div>
    );
};

// Render the MathQuiz component into the HTML element with the id mathQuizRoot
ReactDOM.render(<MathQuiz />, document.getElementById('mathQuizRoot'));