/*
	Slutprojekt (The Movie Database API) - FE23 Javascript 1
	Kristoffer Bengtsson

	Funktionalitet för att visa info om personer från The Movie Database API.
*/

import { fetchJSON } from '../modules/api.js';
import {
	createImageElement,
	createTextField,
	createFieldTitle,
	addListOption,
	createWrapperBox,
	createLinkField,
	animateFlipInElements,
	getIsValidText,
	getIsValidNumber
} from '../modules/dom-utilities.js';
import { showMediaDetails } from '../modules/movie.js';


// Bas-URL för porträtt-foton
const imagesUrl = "https://image.tmdb.org/t/p/h632";


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Event-callbackfunktion för att visa detaljerad info om en person vars ID är satt i "person-id" 
// attributet på elementet som triggar eventet. 
function showPersonDetails(event) {
	event.preventDefault();

	const personId = parseInt(event.currentTarget.getAttribute("person-id"));
	if (getIsValidNumber(personId)) {
		const requestURL = new URL(`https://api.themoviedb.org/3/person/${personId}`);
		fetchJSON(requestURL, (person) => {
			const detailsBox = document.querySelector("#details-dialog");
			// Bygg absolut URL till porträtt-bilden
			if (getIsValidText(person.profile_path, 5)) {
				person.profile_path = imagesUrl + person.profile_path;
			}
			getPersonDetailsCard(person, detailsBox);
			detailsBox.showModal();
		});
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera (och infoga) ett kort med detaljerad info om en person (DOM-element)
function getPersonDetailsCard(person, container) {
	container.innerHTML = "";

	const detailsBox = createWrapperBox(container, "details");
	const personPhoto = createWrapperBox(detailsBox, "details-image");
	const personInfo = createWrapperBox(detailsBox, "details-info");
	const personStats = createWrapperBox(detailsBox, "details-stats");

	const personBiography = person.biography.replaceAll("\n", "<br>").trim();
	let personGender;
	switch (person.gender) {
		case 1: personGender = "Female"; break;
		case 2: personGender = "Male"; break;
		default: personGender = "Other"; break;
	}

	// Foto
	personPhoto.appendChild(createImageElement(person.profile_path, `Photo of ${person.name}`, '../images/no-photo.png'));

	// Huvudinfo-ruta
	personInfo.appendChild(createFieldTitle(person.name, "h2", "details-name"));
	personInfo.appendChild(createTextField('', personBiography, "details-biography", true));
	personInfo.appendChild(createTextField('Known for', person.known_for_department, "details-knownfor"));
	personInfo.appendChild(createTextField('Birthplace', person.place_of_birth, "details-birthplace"));
	personInfo.appendChild(createLinkField('Home page', 'Visit home page', person.homepage, 'details-homepage'));

	// Extra info
	personStats.appendChild(createTextField('Date of birth', person.birthday, "details-birthday"));
	personStats.appendChild(createTextField('Date of death', person.deathday, "details-deathday"));
	personStats.appendChild(createTextField('Gender', personGender, "details-gender"));
	personStats.appendChild(createLinkField('', "IMDB", `https://www.imdb.com/name/${person.imdb_id}/`, "details-link"));

	return detailsBox;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Visa översikt över en samling personer i angivet container-element
function displayPeopleList(people, container) {
	container.innerHTML = "";
	if ((people.total_results > 0) && (people.results.length > 0)) {
		for (const person of people.results) {
			if (getIsValidText(person.profile_path, 5)) {
				person.profile_path = imagesUrl + person.profile_path;
			}
			container.appendChild(getPersonCard(person));
		}
		animateFlipInElements('card');
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett DOM-element med info-kort om en person
function getPersonCard(person) {
	const personCard = createWrapperBox(undefined, '', ['card', 'card-person'], 'article');
	const personName = createFieldTitle(person.name, "h2");
	const personPhoto = createImageElement(person.profile_path, `Photo of ${person.name}`, '../images/no-photo.png', '', '#');
	personCard.append(
		personPhoto,
		personName,
		createTextField("Profession", person.known_for_department),
		createWorkHistoryList("Known from", person.known_for)
	);

	// Gör foto och namn klickbara för att visa detaljerad info
	personName.setAttribute("person-id", person.id);
	personName.addEventListener("click", showPersonDetails);
	personPhoto.setAttribute("person-id", person.id);
	personPhoto.addEventListener("click", showPersonDetails);
	return personCard;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera DOM-objekt med lista över filmer/serier en person medverkar i
function createWorkHistoryList(title, workHistory) {
	const historyBox = document.createElement("div");
	const historyList = document.createElement("ul");
	historyList.classList.add("workhistory-list");

	if (Array.isArray(workHistory) && (workHistory.length > 0)) {
		for (const pastWork of workHistory) {
			const mediaLink = `https://www.themoviedb.org/${pastWork.media_type}/${pastWork.id}`;
			const mediaName = (pastWork.media_type == "tv" ? pastWork.name : pastWork.title);
			const pastWorkOption = addListOption(historyList, `<span class="type-${pastWork.media_type}">${pastWork.media_type}</span><a href="${mediaLink}" target="_blank">${mediaName}</a>`);

			// Visa ruta med mer info om filmer och TV-serier om de klickas på i listan (övriga typer länkar till TMDB-sidan istället)
			if ((pastWork.media_type == "movie") || (pastWork.media_type == "tv")) {
				pastWorkOption.setAttribute("details-id", pastWork.id);
				pastWorkOption.setAttribute("details-type", pastWork.media_type);
				pastWorkOption.addEventListener("click", showMediaDetails);
			}
		}
	}
	else {
		addListOption(historyList, " - ");
	}

	historyBox.append(createFieldTitle(title), historyList);
	return historyBox;
}


export { displayPeopleList, getPersonCard };