/*
    Slutprojekt (The Movie Database API) - FE23 Javascript 1
    Kristoffer Bengtsson

	Funktionalitet för att visa info om filmer från The Movie Database API.
*/

import {fetchJSON} from '../modules/api.js';
import {createImageElement, createTextField, createFieldTitle, createCheckboxOption, createListField, createMovieScorePointElement, createLinkField, createWrapperBox, animateFlipInElements} from '../modules/dom-utilities.js';


const movieGenreList = {};
const imagesUrl = "https://image.tmdb.org/t/p/w342"; 


// Bygg genreväljare-menyn och uppslagslista för genre-namn
fetchMovieGenres( (genreList) => {
	const genreSelector = document.querySelector("#search-genre");
	genreSelector.innerHTML = "";

	if ((genreList.genres !== undefined) && (genreList.genres !== null) && Array.isArray(genreList.genres) && (genreList.genres.length > 0)) {
		genreList.genres.sort( (genreA, genreB) => genreA.name.localeCompare(genreB.name));
		for (const genre of genreList.genres) {
			genreSelector.appendChild(createCheckboxOption(genre.name, genre.id, "search-genre"));
			movieGenreList[genre.id] = genre.name;
		}
	}
});


/*****************************************************************************************************
 * FUNKTIONER
 *****************************************************************************************************/


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Event-callback för att visa detaljerad info om en film vars ID är satt på "movie-id" attributet
// på elementet som triggar eventet. 
function showMovieDetails(event) {
	event.preventDefault();

	const movieId = parseInt(event.currentTarget.getAttribute("movie-id"));
	console.log("MOVIEID", movieId);
	if ((movieId !== undefined) && (movieId !== null) && !isNaN(movieId)) {
		const requestURL = new URL(`https://api.themoviedb.org/3/movie/${movieId}`);
		console.log("URL", requestURL);
		fetchJSON(requestURL, (movie) => {
			console.log("MOVIEDATA", movie);
			const detailsBox = document.querySelector("#details-dialog");
			getMovieDetailsCard(movie, detailsBox);
			detailsBox.showModal();
		});
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Hämta lista över vilka genres som finns från API
function fetchMovieGenres(callbackFunc) {
    const requestURL = new URL(`https://api.themoviedb.org/3/genre/movie/list`);
    requestURL.searchParams.append("language", "en");
    fetchJSON(requestURL, callbackFunc, errorHandlerBackground);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Visa en samling av upp till listItemLimit film-kort. Visa alla och inkludera beskrivning om
// listItemLimit är noll. 
function displayMovieList(movies, container, listItemLimit = 10) {
	container.innerHTML = "";

	if (movies.total_results > 0) {
		let displayCount = 0;
		for (const movie of movies.results) {
			if ((++displayCount > listItemLimit) && (listItemLimit > 0)) {
				break;
			}

     		// Bygg absolut URL till affisch-bilderna
			if ((movie.poster_path !== undefined) && (movie.poster_path !== null) && (movie.poster_path.length > 5)) {
				movie.poster_path = imagesUrl + movie.poster_path;
			}
			container.appendChild(getMovieCard(movie, listItemLimit == 0));
		}
		animateFlipInElements('card');
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett info-kort om en film (DOM-element)
function getMovieCard(movie, showDescription = false) {
	const movieCard = createWrapperBox(undefined, '', ['card', 'card-movie']);
	const movieImage = createImageElement(movie.poster_path, `Movie poster for ${movie.title}`);
	const movieTitle = createFieldTitle(movie.title, "h2");
	movieCard.appendChild(movieImage);
	movieCard.appendChild(movieTitle);
	movieCard.appendChild(createTextField("Release date", movie.release_date));
	movieCard.appendChild(createGenreList("Genre", movie.genre_ids));
	if (showDescription) {
		movieCard.appendChild(createTextField("", movie.overview, "movie-description"));
	}

	movieTitle.setAttribute("movie-id", movie.id);
	movieTitle.addEventListener("click", showMovieDetails); 
 	movieImage.setAttribute("movie-id", movie.id);
	movieImage.addEventListener("click", showMovieDetails); 
	return movieCard;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera och infoga ett kort med detaljerad info om en film (DOM-element)
function getMovieDetailsCard(movie, container) {
	container.innerHTML = "";

	const detailsBox = createWrapperBox(container, "details");
	const moviePoster = createWrapperBox(detailsBox, "details-image");
	const movieInfo = createWrapperBox(detailsBox, "details-info");
	const movieStats = createWrapperBox(detailsBox, "details-stats");

	const movieOverview = movie.overview.replaceAll("\n", "<br>").trim();

	// Poster
	moviePoster.appendChild(createImageElement(imagesUrl + movie.poster_path, `Poster for the movie ${movie.title}`));

	// Info
	movieInfo.appendChild(createFieldTitle(movie.title, "h2", "details-title"));
	movieInfo.appendChild(createTextField('', movie.tagline, "details-tagline"));
	movieInfo.appendChild(createTextField('', movieOverview, "details-overview", true));
	movieInfo.appendChild(createGenreList('Genres', movie.genres));
	movieInfo.appendChild(createTextField('Play time', `${movie.runtime} minutes`, "details-runtime"));
	movieInfo.appendChild(createMovieScoreDisplay('User score', movie.vote_average));

	// Stats
	movieStats.appendChild(createTextField('Original language', movie.original_language, "details-language")); // TODO: Översätt språk-kod till språknamn
	movieStats.appendChild(createTextField('Release date', movie.release_date, "details-release"));
	movieStats.appendChild(createTextField('Status', movie.status, "details-status"));
	movieStats.appendChild(createLinkField('More', "IMDB", `https://www.imdb.com/title/${movie.imdb_id}/`, "details-link"));
	
	return detailsBox;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Översätt genre-ID till text-namn och returnera lista (DOM-element)
function createGenreList(title, genres) {
	const genreNames = [];
	if ((genres !== undefined) && (genres !== null) && Array.isArray(genres) && (genres.length > 0)) {
		for (const genre of genres) {
			if (typeof genre === 'object') {
				if (genre.name !== undefined) {
					genreNames.push(genre.name);
				}
				else if (genre.id !== undefined) {
					genreNames.push(movieGenreList[genre.id] !== undefined ? movieGenreList[genre.id] : `Unknown (${genre})`);
				}
				else {
					genreNames.push(`Unknown (${genre})`);
				}
			}
			else {
				genreNames.push(movieGenreList[genre] !== undefined ? movieGenreList[genre] : `Unknown (${genre})`);
			}
			
		}
	}
	if (genreNames.length == 0) {
		genreNames.push(" - ");
	}
	return createListField(title, genreNames, "genre-list");
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera grafisk representation av betygspoäng [1-10] (DOM-element)
function createMovieScoreDisplay(title, score) {
	// Avrunda betygspoäng till heltal mellan 1-10
	const scoreRounded = Math.max( Math.min( Math.round(score), 10), 1);
	const scoreBox = document.createElement("div");
	const scoreValueBox = document.createElement("span");

	if (title.length > 0) {
		scoreBox.appendChild(createFieldTitle(title));
	}
    for (let i = 1; i <= 10; i++) {
		scoreValueBox.appendChild(createMovieScorePointElement(scoreRounded >= i));
    }
	scoreBox.appendChild(scoreValueBox);
	return scoreBox;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Felhanterare för icke-kritiska API-anrop som görs i bakgrunden
function errorHandlerBackground(error) {
    if (error instanceof MovieAPIError) {
        console.log("Background data loading error", error.errorCode, error.message);
    }
    else {
        console.log("Background data loading error", error);
    }
}


export { getMovieCard, displayMovieList, getMovieDetailsCard, showMovieDetails, movieGenreList };