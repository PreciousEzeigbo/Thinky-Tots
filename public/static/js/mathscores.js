// Class to handle the ScoresPage functionality, which displays leaderboard and personal scores
class ScoresPage {
    constructor() {
        this.currentPage = 1;
        this.currentView = 'leaderboard';
        this.initialize();
    }

    // Initialize the page by attaching event listeners and fetching the scores
    initialize() {
        this.attachEventListeners();
        this.fetchScores();
    }

    // Attaches event listeners to the tab elements to allow view switching
    attachEventListeners() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchView(tab.dataset.view);
            });
        });
    }

    // Asynchronously fetches the scores based on the current view of leaderboard or personal
    async fetchScores() {
        const contentDiv = document.getElementById('scoresContent');
        contentDiv.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const endpoint = this.currentView === 'leaderboard' 
                ? `/api/scores/leaderboard?page=${this.currentPage}` // Fetch leaderboard data
                : `/api/scores/personal?page=${this.currentPage}`; // Fetch personal scores data
            
            // Fetch the scores data from the server
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Failed to fetch scores'); // Handle errors if the fetch fails
            
            const data = await response.json();
            this.renderScores(data);
        } catch (error) {
            // If an error occurs, show an error message
            contentDiv.innerHTML = `
                <div class="error">
                    Error loading scores. Please try again later.
                </div>
            `;
            console.error('Error:', error);
        }
    }

    // Switches between views and resets the current page
    switchView(view) {
        this.currentView = view;
        this.currentPage = 1;

        // Update the active class on tabs based on the selected view
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });
        
        this.fetchScores();
    }

    // Formats the time
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Formats the date
    formatDate(dateString) {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Renders the fetched scores into the HTML table and handles pagination
    renderScores(data) {
        const { scores, total_pages, current_page } = data;
        const startRank = (current_page - 1) * 10 + 1;

        // Generate HTML for the scores table
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
                                <td>${startRank + index}</td> <!-- Rank based on current page -->
                                <td>${score.username}</td> <!-- Player's username -->
                                <td>${score.score}</td> <!-- Player's score -->
                                <td>${score.questions_answered}</td> <!-- Number of questions answered -->
                                <td>${score.max_difficulty}</td> <!-- Maximum difficulty level reached -->
                                <td>${this.formatTime(score.time_taken)}</td> <!-- Time taken, formatted -->
                                <td>${this.formatDate(score.created_at)}</td> <!-- Date of the score, formatted -->
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${this.renderPagination(total_pages, current_page)} <!-- Render pagination controls -->
        `;

        document.getElementById('scoresContent').innerHTML = tableHTML; // Update the scores content in the DOM
        this.attachPaginationListeners(); // Attach event listeners to pagination buttons
    }

    // Generates the pagination controls based on the total number of pages
    renderPagination(totalPages, currentPage) {
        if (totalPages <= 1) return ''; // Don't show pagination if there's only one page

        // Generate pagination HTML
        return `
            <div class="pagination">
                ${Array.from({ length: totalPages }, (_, i) => i + 1) // Generate buttons for each page number
                    .map(page => `
                        <button class="page-button ${page === currentPage ? 'active' : ''}" 
                                data-page="${page}">
                            ${page}
                        </button>
                    `).join('')}
            </div>
        `;
    }

    // Attaches event listeners to pagination buttons to navigate between pages
    attachPaginationListeners() {
        document.querySelectorAll('.page-button').forEach(button => {
            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.dataset.page);
                this.fetchScores();
            });
        });
    }
}

// Initialize the ScoresPage class when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScoresPage();
});
