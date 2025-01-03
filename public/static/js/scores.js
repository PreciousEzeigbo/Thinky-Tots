const ScoresPage = () => {
    const [scores, setScores] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [loading, setLoading] = React.useState(true);

    const fetchScores = async (page) => {
        try {
            const response = await fetch(`/api/scores?page=${page}`);
            const data = await response.json();
            setScores(data.scores);
            setTotalPages(data.total_pages);
            setCurrentPage(data.current_page);
        } catch (error) {
            console.error('Error fetching scores:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchScores(currentPage);
    }, [currentPage]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading scores...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Math Quiz Leaderboard</h1>
                <a 
                    href="/home"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    Play Quiz
                </a>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {scores.map((score, index) => (
                            <tr key={score.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {(currentPage - 1) * 10 + index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{score.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{score.score}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{score.questions_answered}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{score.max_difficulty}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{formatTime(score.time_taken)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{score.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded ${
                                currentPage === page 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

ReactDOM.render(<ScoresPage />, document.getElementById('scoresRoot'));