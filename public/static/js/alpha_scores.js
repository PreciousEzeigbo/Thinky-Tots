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

    // Attach event listeners to all the tabs for switching between leaderboard and personal views
    attachEventListeners() {
        // Select all elements with the tab class
        document.querySelectorAll('.tab').forEach(tab => {
            // Add click event to switch views when the tab is clicked
            tab.addEventListener('click', () => {
                this.switchView(tab.dataset.view);
            });
        });
    }

    // Fetch the scores data from the server and update the page accordingly
    async fetchScores() {
        const contentDiv = document.getElementById('scoresContent');
        contentDiv.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            // Choose the API endpoint based on the current view, leaderboard or personal
            const endpoint = this.currentView === 'leaderboard' 
                ? `/api/alpha-scores/leaderboard?page=${this.currentPage}`
                : `/api/alpha-scores/personal?page=${this.currentPage}`;
            
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Failed to fetch scores');
            
            const data = await response.json();
            this.renderScores(data);
        } catch (error) {
            // Show error message if fetching scores fails
            contentDiv.innerHTML = `
                <div class="error">
                    Error loading scores. Please try again later.
                </div>
            `;
            console.error('Error:', error); // Log the error to the console for debugging
        }
    }

    // Switch between the leaderboard and personal views when a tab is clicked
    switchView(view) {
        this.currentView = view;
        this.currentPage = 1;
        
        // Update active tab to highlight the selected one
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });
        
        this.fetchScores();
    }

    // Format the time
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Format the date
    formatDate(dateString) {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Render the scores in a table format on the page
    renderScores(data) {
        const { scores, total_pages, current_page } = data;
        const startRank = (current_page - 1) * 10 + 1;

        // Create the HTML table for displaying the scores
        const tableHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Score</th>
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
                                <td>${this.formatTime(score.time_taken)}</td>
                                <td>${this.formatDate(score.created_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${this.renderPagination(total_pages, current_page)} <!-- Render pagination controls -->
        `;

        // Update the scores content with the new table
        document.getElementById('scoresContent').innerHTML = tableHTML;
        this.attachPaginationListeners();
    }

    // Render pagination controls based on the total pages and current page
    renderPagination(totalPages, currentPage) {
        if (totalPages <= 1) return '';

        // Create pagination buttons for each page
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

    // Attach event listeners to pagination buttons for switching pages
    attachPaginationListeners() {
        document.querySelectorAll('.page-button').forEach(button => {
            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.dataset.page);
                this.fetchScores();
            });
        });
    }
}

// Initialize the ScoresPage when the DOM is loaded so the page can start interacting
document.addEventListener('DOMContentLoaded', () => {
    new ScoresPage();
});
