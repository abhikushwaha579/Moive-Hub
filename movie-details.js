const movieDetail = document.querySelector("#movie-detail");
const params = new URLSearchParams(location.search)
const imdbID = params.get("id");

if (imdbID) {
    searchMovie(imdbID.trim())
} else {
    movieDetail.innerHTML = `<p class="empty-state">No movie was selected. Return to search and choose a title.</p>`;
}

async function searchMovie(imdbID) {

    movieDetail.innerHTML = `<p class="empty-state">Loading movie details…</p>`;
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=312d642&i=${encodeURIComponent(imdbID)}&plot=full`);
        const data = await response.json();
        if (data.Response === "True") displayMovie(data);
        else movieDetail.innerHTML = `<p class="empty-state">${data.Error || "Movie details were not found."}</p>`;
    } catch {
        movieDetail.innerHTML = `<p class="empty-state">Could not load movie details. Check your connection and try again.</p>`;
    }

}


function displayMovie(data){

   movieDetail.innerHTML = `<article class="details-card">
      <div class="details-poster-wrap">
        ${data.Poster && data.Poster !== "N/A"
            ? `<img class="details-poster" src="${data.Poster}" alt="${data.Title} poster" onerror="this.hidden=true; this.nextElementSibling.hidden=false"><div class="poster-placeholder details-poster-fallback" hidden>🎬</div>`
            : `<div class="poster-placeholder details-poster-fallback">🎬</div>`}
      </div>
      <div class="details-copy">
      <p class="eyebrow">MOVIE PROFILE</p>
      <h1>${data.Title}</h1>
      <div class="details-meta">
        <span class="meta-chip">${data.Year}</span><span class="meta-chip">${data.Released}</span>
        <span class="meta-chip">${data.Rated}</span><span class="meta-chip">${data.Runtime}</span>
        <span class="meta-chip">${data.Genre}</span><span class="meta-chip rating-chip">★ ${data.imdbRating} / 10</span>
      </div>
      <section class="detail-block"><h2>Plot overview</h2><p>${data.Plot}</p></section>
      <div class="detail-columns">
        <section class="detail-block"><h2>Director</h2><p>${data.Director}</p></section>
        <section class="detail-block"><h2>Writer</h2><p>${data.Writer}</p></section>
        <section class="detail-block"><h2>Cast</h2><p>${data.Actors}</p></section>
        <section class="detail-block"><h2>Language · Country</h2><p>${data.Language} · ${data.Country}</p></section>
      </div>
      <a class="primary-button detail-action" href="https://www.imdb.com/title/${encodeURIComponent(data.imdbID)}/" target="_blank" rel="noopener noreferrer">View on IMDb ↗</a>
      </div>
    </article>`

}
