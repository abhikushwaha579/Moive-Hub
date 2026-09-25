const movieForm = document.querySelector("#movieForm");
const movieInput = document.querySelector("#movieInput");
const movieHub = document.querySelector("#movieHub");

movieForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let query = movieInput.value.trim()
    if (!query) {
        return
    }
    searchMovies(query)
})

async function searchMovies(movieName) {

    movieHub.innerHTML = `<span class="loader"></span>`

    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=312d642&s=${encodeURIComponent(movieName)}`);
        const data = await response.json();
        if (data.Response === "True") displayMovies(data.Search);
        else movieHub.innerHTML = `<p class="empty-state">${data.Error || "No movies found. Try another title."}</p>`;
    } catch {
        movieHub.innerHTML = `<p class="empty-state">Could not load movies. Check your connection and try again.</p>`;
    }

}

function displayMovies(movies) {

    movieHub.innerHTML = ""

    movies.forEach((movie) => {
        const div = document.createElement("div")

        div.dataset.imdbID = movie.imdbID
        div.setAttribute("class" , "movie-card")
        div.setAttribute("role", "link")
        div.setAttribute("tabindex", "0")

        div.innerHTML = `
            <div class="movie-poster-wrap">
                ${movie.Poster && movie.Poster !== "N/A"
                    ? `<img class="movie-poster" src="${movie.Poster}" alt="${movie.Title} poster" loading="lazy" onerror="this.hidden=true; this.nextElementSibling.hidden=false"><div class="poster-placeholder" hidden>🎬</div>`
                    : `<div class="poster-placeholder">🎬</div>`}
            </div>
            <div class="movie-card-copy">
                <p class="movie-title">${movie.Title}</p>
                <p class="movie-year">${movie.Year}</p>
            </div>
        `
        movieHub.append(div)
    })
}


movieHub.addEventListener("click" , (e) => {
    e.stopPropagation();
   const movieCard = e.target.closest(".movie-card")
   if (!movieCard) return;
   location.href = `movie-details.html?id=${encodeURIComponent(movieCard.dataset.imdbID)}`
})

movieHub.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".movie-card")) {
        e.preventDefault();
        e.target.click();
    }
});
