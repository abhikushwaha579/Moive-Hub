const movieForm = document.querySelector("#movieForm");
const movieInput = document.querySelector("#movieInput");
const movieHub = document.querySelector("#movieHub");
const moviesHeading = document.querySelector("#moviesHeading");
const moviesSubheading = document.querySelector("#moviesSubheading");

const API_KEY = "312d642";
let activeRequest = 0;
const recentMovies = [
    { title: "Superman", year: "2025" },
    { title: "F1", year: "2025" },
    { title: "Jurassic World: Rebirth", year: "2025" },
    { title: "The Fantastic Four: First Steps", year: "2025" },
    { title: "How to Train Your Dragon", year: "2025" },
    { title: "Final Destination: Bloodlines", year: "2025" },
    { title: "Wicked", year: "2024" },
    { title: "Moana 2", year: "2024" }
];

movieForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = movieInput.value.trim();
    if (query) searchMovies(query);
});

movieInput.addEventListener("input", () => {
    if (!movieInput.value.trim()) showRecentlyReleased();
});

function updateSection(title, subtitle) {
    moviesHeading.textContent = title;
    moviesSubheading.textContent = subtitle;
}

function setLoading(count, skeleton = false) {
    movieHub.setAttribute("aria-busy", "true");
    movieHub.innerHTML = skeleton
        ? Array.from({ length: count }, () => `<div class="movie-skeleton" aria-hidden="true"><div class="skeleton-poster"></div><div class="skeleton-copy"><i></i><i></i><i></i></div></div>`).join("")
        : `<span class="loader" aria-label="Loading movies"></span>`;
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
}

async function showRecentlyReleased() {
    const requestId = ++activeRequest;
    updateSection("🎬 Recently Released Movies", "Fresh picks from 2024–2026");
    setLoading(recentMovies.length, true);

    const movies = await Promise.all(recentMovies.map(async ({ title, year }) => {
        try {
            const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}&y=${year}`);
            const movie = await response.json();
            return movie.Response === "True" ? movie : { Title: title, Year: year, Response: "False" };
        } catch {
            return { Title: title, Year: year, Response: "False" };
        }
    }));

    if (requestId === activeRequest) displayMovies(movies, true);
}

async function searchMovies(movieName) {
    const requestId = ++activeRequest;
    updateSection(`Search results for “${movieName}”`, "Select a movie to see its details");
    setLoading(1);

    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(movieName)}`);
        const data = await response.json();
        if (requestId !== activeRequest) return;
        if (data.Response !== "True") {
            movieHub.innerHTML = `<p class="empty-state">${escapeHTML(data.Error || "No movies found. Try another title.")}</p>`;
            movieHub.setAttribute("aria-busy", "false");
            return;
        }

        const movies = await Promise.all(data.Search.map(async (movie) => {
            try {
                const detailsResponse = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${encodeURIComponent(movie.imdbID)}`);
                const details = await detailsResponse.json();
                return details.Response === "True" ? details : movie;
            } catch {
                return movie;
            }
        }));
        if (requestId === activeRequest) displayMovies(movies);
    } catch {
        if (requestId !== activeRequest) return;
        movieHub.innerHTML = `<p class="empty-state">Could not load movies. Check your connection and try again.</p>`;
        movieHub.setAttribute("aria-busy", "false");
    }
}

function displayMovies(movies, recent = false) {
    movieHub.innerHTML = "";
    movies.forEach((movie, index) => {
        const card = document.createElement("article");
        const hasDetails = Boolean(movie.imdbID);
        card.className = "movie-card";
        card.style.setProperty("--card-index", index);

        const poster = movie.Poster && movie.Poster !== "N/A"
            ? `<img class="movie-poster" src="${escapeHTML(movie.Poster)}" alt="${escapeHTML(movie.Title)} poster" loading="lazy" onerror="this.hidden=true; this.nextElementSibling.hidden=false"><div class="poster-placeholder" hidden>🎬</div>`
            : `<div class="poster-placeholder">🎬</div>`;

        card.innerHTML = `
            <div class="movie-poster-wrap">${poster}</div>
            <div class="movie-card-copy">
                <div><p class="movie-title">${escapeHTML(movie.Title)}</p><p class="movie-year">${escapeHTML(movie.Year || "Year unavailable")}</p></div>
                <p class="movie-rating">${movie.imdbRating && movie.imdbRating !== "N/A" ? `★ ${escapeHTML(movie.imdbRating)} <span>IMDb</span>` : `<span class="rating-unavailable">Rating unavailable</span>`}</p>
                ${hasDetails ? `<a class="movie-details-button" href="movie-details.html?id=${encodeURIComponent(movie.imdbID)}">View Details <span aria-hidden="true">→</span></a>` : `<span class="movie-details-button is-disabled" aria-disabled="true">Details unavailable</span>`}
            </div>`;
        movieHub.append(card);
    });
    movieHub.setAttribute("aria-busy", "false");
    movieHub.classList.remove("is-loaded");
    requestAnimationFrame(() => movieHub.classList.add("is-loaded"));
    if (recent && movies.every((movie) => !movie.imdbID)) {
        moviesSubheading.textContent = "Titles are listed below; posters and ratings need a working OMDb API key";
    }
}

showRecentlyReleased();
