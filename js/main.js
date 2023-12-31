/*
	Slutprojekt (The Movie Database API) - FE23 Javascript 1
	Kristoffer Bengtsson

	Sida som visar topplistor och sökresultat från The Movie Database API.
	https://www.themoviedb.org/

    Använder anime.js för animation av genrefilter-rutan och busy-indikator.
    https://animejs.com/
*/

import anime from '../lib/anime.es.js';
import { displayPeopleList } from '../modules/person.js';
import { displayMovieList, fetchGenreData } from '../modules/movie.js';
import { fetchJSON, setAPIErrorDisplayFunction } from '../modules/api.js';
import { getIsValidNumber, createCheckboxOption } from '../modules/dom-utilities.js';

// GLOBAL: Innehåller info om senaste sökningen som användaren gjort.
const lastSearch = {
	type: '',
	query: '',
	page: 0,
	pageMax: 0,
	perPage: 20
}

// GLOBAL: Animation för snurrande upptagen-indikator.
let busyAnimation;


// Sätt funktion som skall användas för att visa API/fetch-fel för användaren.
setAPIErrorDisplayFunction(displayErrorMessage);

// Bygg genrefilter-rutorna och uppslagslista för genrenamn.
fetchGenreData(buildGenreFilter);


/*****************************************************************************************************
 * EVENT HANDLERS
 *****************************************************************************************************/


//////////////////////////////////////////////////////////////////////////////////////////////////////
// NAV - Klickad flik: Topp 10 topp-rankade filmer
document.querySelector("#display-mode-toprated").addEventListener("click", (event) => {
	document.querySelector("#search-form").classList.add("hide");
	document.querySelector("#filter-form").classList.remove("hide");
	resetSearchResults();
	loadMovieTopLists("vote_average");
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// NAV - Klickad flik: Topp 10 populära filmer
document.querySelector("#display-mode-popular").addEventListener("click", (event) => {
	document.querySelector("#search-form").classList.add("hide");
	document.querySelector("#filter-form").classList.remove("hide");
	resetSearchResults();
	loadMovieTopLists("popularity");
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// NAV - Klickad flik: Sök efter film eller person
document.querySelector("#display-mode-search").addEventListener("click", (event) => {
	const inputField = document.querySelector("#search-input");
	document.querySelector("#search-form").classList.remove("hide");
	document.querySelector("#filter-form").classList.add("hide");
	inputField.value = "";
	inputField.focus();
	resetSearchResults();
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Sökformulär för film/person
document.querySelector("#search-form").addEventListener("submit", (event) => {
	event.preventDefault();

	const searchType = document.querySelector("#search-type").value;
	const inputText = document.querySelector("#search-input").value.trim();

	resetSearchResults();
	if (inputText.length > 0) {
		findMovieOrPerson(searchType, inputText);
	}
	else {
		displayErrorMessage(`Please enter the name of a ${searchType} to search for.`);
	}
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Flytta fokus till sökfältet när söktyp ändras
document.querySelector("#search-type").addEventListener("change", (event) => {
	const searchInput = document.querySelector("#search-input");
	searchInput.focus();
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Markera ev. befintlig text i sökfältet när det får fokus
document.querySelector("#search-input").addEventListener("focus", (event) => {
	event.target.select();
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Filtrera visad topplista utifrån valda genres
document.querySelector("#filter-form").addEventListener("submit", (event) => {
	event.preventDefault();

	// Markera/avmarkera alla kryssrutor
	if ((event.submitter.id == "filter-deselect-all") || (event.submitter.id == "filter-select-all")) {
		const checkedBoxes = event.target.querySelectorAll(`input[type="checkbox"]`);
		for (const checkedBox of checkedBoxes) {
			checkedBox.checked = (event.submitter.id == "filter-select-all");
		}
	}
	// Uppdatera visning av topplista med valt filter
	else {
		const currentTab = document.querySelector(`input[name="display-mode"]:checked`).value;
		resetSearchResults();
		if (currentTab == "toprated") {
			loadMovieTopLists("vote_average");
		}
		else if (currentTab == "popular") {
			loadMovieTopLists("popularity");
		}
	}
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Sidnavigering-formulär för sökresultat (vid stora sökresultat uppdelade på flera sidor)
document.querySelector("#pages-nav").addEventListener("submit", (event) => {
	event.preventDefault();
	event.submitter.blur();

	// Föregående sida
	if (event.submitter.id == "pages-nav-prev") {
		if (lastSearch.page > 1) {
			findSearchResultPage(lastSearch.page - 1);
		}
	}
	// Nästa sida
	else if (event.submitter.id == "pages-nav-next") {
		if (lastSearch.page < lastSearch.pageMax) {
			findSearchResultPage(lastSearch.page + 1);
		}
	}
	// Första sidan
	else if (event.submitter.id == "pages-nav-first") {
		findSearchResultPage(1);
	}
	// Sista sidan
	else if (event.submitter.id == "pages-nav-last") {
		findSearchResultPage(lastSearch.pageMax);
	}
	// Ange sidnummer
	else if (event.submitter.id == "pages-nav-goto") {
		const pageInput = document.querySelector("#pages-goto-page");
		pageInput.setAttribute("max", lastSearch.pageMax);
		pageInput.value = lastSearch.page;
		pageInput.select();
		document.querySelector("#pages-goto-dialog").showModal();
	}
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Dialogruta-formulär för att ange en specifik sida att gå till i sökresultatet
document.querySelector("#pages-goto-form").addEventListener("submit", (event) => {
	const pageInput = document.querySelector("#pages-goto-page").value;
	if ((pageInput.length > 0) && getIsValidNumber(pageInput) && (pageInput >= 1) && (pageInput <= lastSearch.pageMax)) {
		findSearchResultPage(pageInput);
	}
	else {
		displayErrorMessage(`Invalid page of search results specified. It must be a number between 1 and ${lastSearch.pageMax}.`);
	}
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Klicka utanför rutan eller tryck på ESC-tangenten för att stänga Movie/TV/Person-details dialogrutan
document.querySelector("#details-dialog").addEventListener("click", (event) => {
	if (event.target.id == event.currentTarget.id) {
		event.currentTarget.close();
	}
});

document.querySelector("#details-dialog").addEventListener("keydown", (event) => {
	if (event.key == "Escape") {
		event.currentTarget.close();
	}
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Kontroll för att dölja eller visa genre-filtret för topplistorna
document.querySelector("#filter-hide").addEventListener("click", (event) => {
	if (event.currentTarget.classList.contains("hidden")) {
		event.currentTarget.classList.remove("hidden");
		event.currentTarget.title = "Hide genre filter";
		showGenreFilter(true);
	}
	else {
		event.currentTarget.classList.add("hidden");
		event.currentTarget.title = "Show genre filter";
		showGenreFilter(false);
	}
	event.currentTarget.alt = event.currentTarget.title;
});



/*****************************************************************************************************
 * FUNKTIONER
 *****************************************************************************************************/


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Hämta och visa Top Rated eller Popular movies topplista från API
// Se: https://developer.themoviedb.org/reference/discover-movie
function loadMovieTopLists(listType, showResultPage = 1) {
	const showGenres = getFilterSelectedGenres();

	// Rensa sparad data om senaste sökning och nollställ sidnav-raden
	lastSearch.type = '';
	lastSearch.query = '';
	lastSearch.page = 0;
	lastSearch.pageMax = 0;
	displayPageNav(0, 0);

	if (showGenres.selected.length > 0) {
		const requestURL = new URL("https://api.themoviedb.org/3/discover/movie");
		requestURL.searchParams.append("sort_by", `${listType}.desc`);
		requestURL.searchParams.append("page", showResultPage);
		requestURL.searchParams.append("vote_count.gte", "200");
		requestURL.searchParams.append("include_adult", "false");
		requestURL.searchParams.append("with_genres", showGenres.selected.join("|"));
		if ((showGenres.excluded.length > 0) && showGenres.onlyShowSelected) {
			requestURL.searchParams.append("without_genres", showGenres.excluded.join("|"));
		}

		setIsBusy(true);
		fetchJSON(requestURL, (movies) => {
			if (Array.isArray(movies.results) && (movies.results.length > 0)) {
				displayMovieList(movies, document.querySelector("#results"), 10);
				setIsBusy(false);
			}
			else {
				displayErrorMessage("Top lists are currently unavailable. Try again later.");
			}
		});
	}
	else {
		displayErrorMessage("Please select at least one genre of movies to show.");
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Utför sökning på en film eller person
// Se: https://developer.themoviedb.org/reference/search-movie
//     https://developer.themoviedb.org/reference/search-person
function findMovieOrPerson(searchType, searchInput, searchPage = 0) {
	const requestURL = new URL(`https://api.themoviedb.org/3/search/${searchType}`);
	requestURL.searchParams.append("query", searchInput);
	requestURL.searchParams.append("include_adult", "false");
	if (searchPage > 0) {
		requestURL.searchParams.append("page", searchPage);
	}

	lastSearch.type = searchType;
	lastSearch.query = searchInput;
	lastSearch.page = searchPage;

	setIsBusy(true);
	fetchJSON(requestURL, showSearchResults);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Hämta en angiven sida med sökresultat från föregående sökning
function findSearchResultPage(page) {
	if ((lastSearch.pageMax > 0) && (page <= lastSearch.pageMax) && (page > 0) && (lastSearch.type.length > 0) && (lastSearch.query.length > 0)) {
		findMovieOrPerson(lastSearch.type, lastSearch.query, page);
	}
	else {
		displayErrorMessage("Please specify what you are looking for in the search box above.");
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Visa resultat av sökning på film eller person 
function showSearchResults(searchResults) {
	displayPageNav(searchResults.page, searchResults.total_pages);

	if (Array.isArray(searchResults.results) && (searchResults.results.length > 0)) {
		const resultsBox = document.querySelector("#results");

		displaySearchSummary(searchResults.results.length, searchResults.total_results);

		// Title-fältet finns: det är en film
		if (searchResults.results[0].title !== undefined) {
			displayMovieList(searchResults, resultsBox, 0, true);
		}
		// Name-fältet finns: det är en person
		else if (searchResults.results[0].name !== undefined) {
			displayPeopleList(searchResults, resultsBox);
		}
		else {
			displayErrorMessage("Unhandled search result type received.");
		}
	}
	else {
		displayErrorMessage("There was no match for your search. Try searching for something else?");
	}
	setIsBusy(false);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Visa sid-navigering vid sökresultat som sträcker sig över flera sidor (20 st visas per sida)
function displayPageNav(currentPage, totalPages) {
	const pagesNav = document.querySelector("#pages-nav");

	lastSearch.page = (!getIsValidNumber(currentPage) ? 0 : currentPage);
	lastSearch.pageMax = (!getIsValidNumber(totalPages) ? 0 : totalPages);

	if (lastSearch.pageMax > 1) {
		pagesNav.querySelector("#pages-nav-goto").innerHTML = `Page ${lastSearch.page} / ${lastSearch.pageMax}`;
		pagesNav.querySelector("#pages-nav-first").disabled = (lastSearch.page == 1);
		pagesNav.querySelector("#pages-nav-prev").disabled = (lastSearch.page == 1);
		pagesNav.querySelector("#pages-nav-next").disabled = (lastSearch.page == lastSearch.pageMax);
		pagesNav.querySelector("#pages-nav-last").disabled = (lastSearch.page == lastSearch.pageMax);
		pagesNav.classList.add("show");
	}
	else {
		pagesNav.classList.remove("show");
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera listor på valda och icke-valda genres i topplistor-filtret
function getFilterSelectedGenres() {
	const genreBoxes = document.querySelectorAll(`#filter-genre input[name="filter-genre"]`);
	const filterType = document.querySelector(`#filter-genre-controls input[name="filter-method"]:checked`).value;
	const selectedGenres = [];
	const excludedGenres = [];

	if ((genreBoxes !== undefined) && (genreBoxes.length > 0)) {
		for (const genreBox of genreBoxes) {
			if (genreBox.checked) {
				selectedGenres.push(genreBox.value);
			}
			else {
				excludedGenres.push(genreBox.value);
			}

		}
	}
	return { selected: selectedGenres, excluded: excludedGenres, onlyShowSelected: (filterType == "selected-only") };
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Visa felmeddelande för användaren 
function displayErrorMessage(errorText) {
	const errorBox = document.querySelector("#errors");
	if (errorText.length > 0) {
		const errorMessage = document.createElement("div");
		errorMessage.innerText = errorText;
		errorBox.appendChild(errorMessage);
	}
	errorBox.classList.add("show");
	setIsBusy(false);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Nollställ sökformulär visade resultat
function resetSearchResults() {
	const errorBox = document.querySelector("#errors");
	errorBox.classList.remove("show");
	errorBox.innerHTML = "";

	displaySearchSummary(false);
	document.querySelector("#results").innerHTML = "";
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Visa sammanställning av hur många matchningar senaste sökningen gav och vad som visas.
function displaySearchSummary(currentCount, totalCount) {
	const searchSummaryBox = document.querySelector("#search-form-summary");

	// Nollställ och göm sammanställning-rutan istället.
	if (currentCount === false) {
		searchSummaryBox.classList.remove("show");
		searchSummaryBox.innerHTML = "";
		return;
	}
	else {
		searchSummaryBox.classList.add("show");
	}

	currentCount = (!getIsValidNumber(currentCount) ? 0 : currentCount);
	totalCount = (!getIsValidNumber(totalCount) ? 0 : totalCount);

	if ((currentCount == 0) || (totalCount == 0)) {
		searchSummaryBox.innerText = `No ${lastSearch.type} matched your search for "${lastSearch.query}".`;
	}
	else if (totalCount > currentCount) {
		let intervalStart = (lastSearch.page * lastSearch.perPage) - (lastSearch.perPage - 1)
		let intervalEnd = lastSearch.page * lastSearch.perPage;
		intervalEnd = (intervalEnd > totalCount ? totalCount : intervalEnd);
		searchSummaryBox.innerText = `${totalCount} ${lastSearch.type}${totalCount == 1 ? "" : "s"} found matching "${lastSearch.query}"`;
		searchSummaryBox.innerText += (intervalStart == intervalEnd ? `, showing last one.` : `, showing ${intervalStart}-${intervalEnd}.`);
	}
	else {
		searchSummaryBox.innerText = `${currentCount} ${lastSearch.type}${currentCount == 1 ? "" : "s"} found matching "${lastSearch.query}".`;
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Visa användaren att sidan håller på med något som tar lite tid och spärra nya sökningar under tiden
function setIsBusy(isBusy) {
	const busyBox = document.querySelector("#busy");

	// Skapa snurr-animation om den inte redan finns
	if (busyAnimation === undefined) {
		busyAnimation = anime({
			targets: "#busy-spinner",
			duration: 2000,
			easing: 'linear',
			autoplay: false,
			loop: true,
			keyframes: [
				{ rotate: '360deg', easing: 'linear' },
			],
			borderWidth: [
				{ value: '7px', duration: 1000 },
				{ value: '14px', duration: 1000 },
			],
		});
	}

	if (isBusy) {
		busyBox.classList.add("show");
		busyAnimation.play();
	}
	else {
		busyAnimation.restart();
		busyAnimation.pause();
		busyBox.classList.remove("show");
	}
	document.querySelector("#search-submit").disabled = isBusy;
	document.querySelector("#filter-submit").disabled = isBusy;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Bygg genrefilter-kryssrutor till topplistorna
function buildGenreFilter(genreList) {
	const genreSelector = document.querySelector("#filter-genre");
	genreSelector.innerHTML = "";
	
	if ((genreList.genres !== undefined) && (genreList.genres !== null) && Array.isArray(genreList.genres) && (genreList.genres.length > 0)) {
		for (const genre of genreList.genres) {
			genreSelector.appendChild(createCheckboxOption(genre.name, genre.id, "filter-genre"));
		}
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Göm/visa genrefiltet på topplistorna
function showGenreFilter(filterVisible) {
	const genrePicker = document.querySelector("#filter-genre");
	const formControls = document.querySelector("#filter-genre-controls");

	if (filterVisible) {
		genrePicker.classList.remove("hide");
		anime({
			targets: "#filter-genre",
			duration: 500,
			easing: 'linear', 
			autoplay: true,
			scaleY: [
				{value: '0%', duration: 0},
				{value: '100%'},
			],
		}).finished.then(() => {
			formControls.classList.remove("hide");
			anime({
				targets: "#filter-genre-controls",
				duration: 350,
				easing: 'linear', 
				autoplay: true,
				scaleY: [
					{value: '0%', duration: 0},
					{value: '100%'},
				],
			});
		});
	}
	else {
		anime({
			targets: "#filter-genre-controls",
			duration: 350,
			easing: 'linear', 
			autoplay: true,
			scaleY: [
				{value: '100%', duration: 0},
				{value: '0%'},
			],
		}).finished.then(() => {
			formControls.classList.add("hide");
			anime({
				targets: "#filter-genre",
				duration: 500,
				easing: 'linear', 
				autoplay: true,
				scaleY: [
					{value: '100%', duration: 0},
					{value: '0%'},
				],
			}).finished.then(() => {
				genrePicker.classList.add("hide");				
			});
		});
	}
}