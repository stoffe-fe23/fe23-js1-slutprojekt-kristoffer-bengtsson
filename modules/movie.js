/*
	Slutprojekt (The Movie Database API) - FE23 Javascript 1
	Kristoffer Bengtsson

	Funktionalitet för att visa info om filmer från The Movie Database API.
*/

import { fetchJSON } from '../modules/api.js';
import {
	createImageElement,
	createTextField,
	createFieldTitle,
	createListField,
	createRatingScorePointElement,
	createLinkField,
	createWrapperBox,
	animateFlipInElements,
	animateFadeInScoreElements,
	getIsValidText,
	getIsValidNumber,
	getTruncatedText
} from '../modules/dom-utilities.js';


// Bas-URL för film-affischer
const imagesUrl = "https://image.tmdb.org/t/p/w342";

// Lista för översättning av genre-ID till genre-namn
let movieGenreList = {};


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Visa en samling av upp till displayLimit filminfo-kort (0 = visa alla). Inkludera beskrivning om 
// includeDescription är satt. 
function displayMovieList(movies, container, displayLimit = 0, includeDescription = false) {
	container.innerHTML = "";
	if ((movies.total_results > 0) && (movies.results.length > 0)) {
		movies.results = (displayLimit > 0 ? movies.results.slice(0, displayLimit) : movies.results);
		for (const movie of movies.results) {
			if (getIsValidText(movie.poster_path, 5)) {
				movie.poster_path = imagesUrl + movie.poster_path;
			}
			container.appendChild(getMovieCard(movie, includeDescription));
		}
		animateFlipInElements('card');
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett info-kort om en film (DOM-element)
function getMovieCard(movie, showDescription = false) {
	const movieCard = createWrapperBox(undefined, '', ['card', 'card-movie'], 'article');
	const movieImage = createImageElement(movie.poster_path, `Movie poster for ${movie.title}`, './images/no-poster.png', '', '#');
	const movieTitle = createFieldTitle(movie.title, "h2");
	movieCard.appendChild(movieImage);
	movieCard.appendChild(movieTitle);
	movieCard.appendChild(createTextField("Release date", movie.release_date));
	movieCard.appendChild(createGenreList("Genre", movie.genre_ids));
	if (showDescription) {
		movieCard.appendChild(createTextField("", getTruncatedText(movie.overview, 200), "movie-description"));
	}

	// Gör titel och affisch klickbara för att visa detaljerad info
	movieTitle.setAttribute("details-id", movie.id);
	movieTitle.addEventListener("click", showMediaDetails);
	movieImage.setAttribute("details-id", movie.id);
	movieImage.addEventListener("click", showMediaDetails);
	return movieCard;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Event-callbackfunktion för att visa detaljerad info om en film eller TV-serie vars ID är satt på 
// "details-id" attributet på elementet som triggar eventet. Attributet "details-type" anger om det
// är en film eller TV-serie som ska visas (film om attributet ej är satt).
function showMediaDetails(event) {
	event.preventDefault();

	const detailsId = parseInt(event.currentTarget.getAttribute("details-id"));
	let detailsType = event.currentTarget.getAttribute("details-type");
	if (!getIsValidText(detailsType, 1)) {
		detailsType = "movie";
	}
	if (getIsValidNumber(detailsId)) {
		const requestURL = new URL(`https://api.themoviedb.org/3/${detailsType}/${detailsId}`);
		fetchJSON(requestURL, (result) => {
			const detailsBox = document.querySelector("#details-dialog");

			if (getIsValidText(result.poster_path, 5)) {
				result.poster_path = imagesUrl + result.poster_path;
			}

			if (detailsType == "movie") {
				getMovieDetailsCard(result, detailsBox);
			}
			else if (detailsType == "tv") {
				getTVSeriesDetailsCard(result, detailsBox);
			}
			detailsBox.showModal();
			animateFadeInScoreElements('scored');
		});
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera och infoga ett kort med detaljerad info om en film (DOM-element)
function getMovieDetailsCard(movie, container) {
	container.innerHTML = "";

	// Översättning av språk-koder till språknamn
	const languages = new Intl.DisplayNames('en', { type: 'language' });

	const detailsBox = createWrapperBox(container, "details");
	const moviePoster = createWrapperBox(detailsBox, "details-image");
	const movieInfo = createWrapperBox(detailsBox, "details-info");
	const movieStats = createWrapperBox(detailsBox, "details-stats");

	// Affisch
	moviePoster.appendChild(createImageElement(movie.poster_path, `Poster for the movie ${movie.title}`, './images/no-poster.png'));

	// Info
	movieInfo.appendChild(createFieldTitle(movie.title, "h2", "details-title"));
	if (movie.tagline.length > 0) {
		movieInfo.appendChild(createTextField('', movie.tagline, "details-tagline"));
	}
	movieInfo.append(
		createTextField('', movie.overview.replaceAll("\n", "<br>").trim(), "details-overview", true),
		createGenreList('Genres', movie.genres),
		createTextField('Play time', `${movie.runtime} minutes`, "details-runtime"),
		createRatingScoreDisplay('Viewer rating', movie.vote_average)
	);

	// Extra-stats
	movieStats.append(
		createTextField('Original language', languages.of(movie.original_language), "details-language"),
		createTextField('Release date', movie.release_date, "details-release"),
		createTextField('Status', movie.status, "details-status"),
		createLinkField('More', "IMDB", `https://www.imdb.com/title/${movie.imdb_id}/`, "details-link")
	);

	return detailsBox;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera och infoga ett kort med detaljerad info om en TV-serie (DOM-element)
function getTVSeriesDetailsCard(series, container) {
	container.innerHTML = "";

	// Översättning av språk-koder till språknamn
	const languages = new Intl.DisplayNames('en', { type: 'language' });

	const detailsBox = createWrapperBox(container, "details", "details-series");
	const seriesPoster = createWrapperBox(detailsBox, "details-image");
	const seriesInfo = createWrapperBox(detailsBox, "details-info");
	const seriesStats = createWrapperBox(detailsBox, "details-stats");

	// Affisch
	seriesPoster.appendChild(createImageElement(series.poster_path, `Poster for the TV-series ${series.name}`, './images/no-poster.png'));

	// Info
	seriesInfo.appendChild(createFieldTitle(series.name, "h2", "details-title"));
	if (series.tagline.length > 0) {
		seriesInfo.appendChild(createTextField('', series.tagline, "details-tagline"));
	}
	seriesInfo.append(
		createTextField('', series.overview.replaceAll("\n", "<br>").trim(), "details-overview-series", true),
		createGenreList('Genres', series.genres),
		createTextField('Number of seasons', `${series.number_of_seasons}`, "details-seasons"),
		createTextField('Number of episodes', `${series.number_of_episodes}`, "details-episodes"),
		createTextField('Episode play time', `${series.episode_run_time} minutes`, "details-runtime")
	);
	if (series.networks.length > 0) {
		seriesInfo.appendChild(createListField('Aired on networks', series.networks.map((network) => network.name), "networks-list"));
	}
	seriesInfo.appendChild(createRatingScoreDisplay('Viewer rating', series.vote_average));

	// Extra-stats
	seriesStats.append(
		createTextField('Original language', languages.of(series.original_language), "details-language"),
		createTextField('First aired', series.first_air_date, "details-release"),
		createTextField('Last aired', series.last_air_date, "details-release"),
		createTextField('Status', series.status, "details-status"),
		createLinkField('More', "TMDB", `https://www.themoviedb.org/tv/${series.id}`, "details-link")
	);

	return detailsBox;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera HTML-lista över genres (DOM-element)
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
		genreNames.push("Uncategorized");
	}
	return createListField(title, genreNames, "genre-list");
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera grafisk representation av betygspoäng (DOM-element)
function createRatingScoreDisplay(title, score) {
	// Avrunda betygspoäng till heltal mellan 0-10 och skapa motsv. antal guldstjärnor
	const scoreRounded = Math.max(Math.min(Math.round(score), 10), 0);
	const scoreBox = document.createElement("div");
	const scoreValueBox = document.createElement("span");

	if (title.length > 0) {
		scoreBox.appendChild(createFieldTitle(title));
	}
	for (let i = 1; i <= 10; i++) {
		scoreValueBox.appendChild(createRatingScorePointElement(scoreRounded >= i));
	}
	scoreBox.appendChild(scoreValueBox);
	return scoreBox;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Hämta genre-data från API och bygg uppslagslista.
// Se: https://developer.themoviedb.org/reference/genre-movie-list
function fetchGenreData(callbackFunc) {
	const fetchResultPromise = fetchJSON('https://api.themoviedb.org/3/genre/movie/list', (genreList) => {
		// Bygg genre-uppslagslista för ID till Namn
		if ((genreList.genres !== undefined) && (genreList.genres !== null) && Array.isArray(genreList.genres) && (genreList.genres.length > 0)) {
			movieGenreList = {};
			genreList.genres.sort((genreA, genreB) => genreA.name.localeCompare(genreB.name));
			for (const genre of genreList.genres) {
				movieGenreList[genre.id] = genre.name;
			}
		}
	}, "Unable to load genre list. Movie filters may be unavailable.");

	// Skicka resultat till callback med om den är satt
	if (typeof callbackFunc == "function") {
		fetchResultPromise.then(callbackFunc);
	}
}


export { getMovieCard, displayMovieList, getMovieDetailsCard, showMediaDetails, fetchGenreData };