class ScoresPage {
    constructor() {
        this.currentPage = 1;
        this.currentView = 'leaderboard';
        this.initialize();
    }

    initialize() {
        this.attachEventListeners();
        this.fetchScores();
    }

    attachEventListeners() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchView(tab.dataset.view);
            });
        });
    }

    async fetchScores() {
        const contentDiv = document.getElementById('scoresContent');
        contentDiv.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const endpoint = this.currentView === 'leaderboard' 
                ? `/api/scores/leaderboard?page=${this.currentPage}`
                : `/api/scores/personal?page=${this.currentPage}`;
            
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Failed to fetch scores');
            
            const data = await response.json();
            this.renderScores(data);
        } catch (error) {
            contentDiv.innerHTML = `
                <div class="error">
                    Error loading scores. Please try again later.
                </div>
            `;
            console.error('Error:', error);
        }
    }

    switchView(view) {
        this.currentView = view;
        this.currentPage = 1;

        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });
        
        this.fetchScores();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    renderScores(data) {
        const { scores, total_pages, current_page } = data;
        const startRank = (current_page - 1) * 10 + 1;

        const tableHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Score</th>
                            <th>Questions</th>
                            <th>Max Level</th>
                            <th>Time</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scores.map((score, index) => `
                            <tr>
                                <td>${startRank + index}</td>
                                <td>${score.username}</td>
                                <td>${score.score}</td>
                                <td>${score.questions_answered}</td>
                                <td>${score.max_difficulty}</td>
                                <td>${this.formatTime(score.time_taken)}</td>
                                <td>${this.formatDate(score.created_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${this.renderPagination(total_pages, current_page)}
        `;

        document.getElementById('scoresContent').innerHTML = tableHTML;
        this.attachPaginationListeners();
    }

    renderPagination(totalPages, currentPage) {
        if (totalPages <= 1) return '';

        return `
            <div class="pagination">
                ${Array.from({ length: totalPages }, (_, i) => i + 1)
                    .map(page => `
                        <button class="page-button ${page === currentPage ? 'active' : ''}" 
                                data-page="${page}">
                            ${page}
                        </button>
                    `).join('')}
            </div>
        `;
    }

    attachPaginationListeners() {
        document.querySelectorAll('.page-button').forEach(button => {
            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.dataset.page);
                this.fetchScores();
            });
        });
    }
}

// Initialize the scores page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScoresPage();
});
