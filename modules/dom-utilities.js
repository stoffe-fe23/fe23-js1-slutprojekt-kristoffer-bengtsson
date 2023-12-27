/*
    Slutprojekt (The Movie Database API) - FE23 Javascript 1
    Kristoffer Bengtsson

	Gemensamma verktygsfunktioner för att skapa DOM-element för visning av film/person-info.
*/

import anime from '../lib/anime.es.js';


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett bild-element
export function createImageElement(url, text, placeholderImage = '../images/no-poster.png', cssClass = '') {
	const imageElement = document.createElement("img");
	imageElement.alt = (getIsValidText(text) ? text : "No description");
	imageElement.src = (getIsValidText(url, 10) ? url : placeholderImage);
	if (cssClass.length > 0 ) {
		imageElement.classList.add(cssClass);
	}
	return imageElement;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett text-element med en rubrik
export function createTextField(title, text, cssClass = '', allowHTML = false) {
	const textField = document.createElement("div");
	if (cssClass.length > 0 ) {
		textField.classList.add(cssClass);
	}
    if (title.length > 0) {
        textField.appendChild(createFieldTitle(title));    
    }
	if (allowHTML) {
		textField.innerHTML += (getIsValidText(text) ? text : " - ");
	}
	else {
		textField.appendChild(document.createTextNode(getIsValidText(text) ? text : " - "));
	}
	return textField;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett rubrik-element av angiven rubriksnivå
export function createFieldTitle(text, type = "h3", cssClass = '') {
	const fieldTitle = document.createElement(type);
	fieldTitle.innerText = ( getIsValidText(text) ? text : "Untitled" );
	if (cssClass.length > 0 ) {
		fieldTitle.classList.add(cssClass);
	}
	return fieldTitle;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera en HTML-lista med en rubrik
export function createListField(title, listItems, cssClass = '', listType = 'ul') {
	const listWrapper = document.createElement("div");
	const listElement = document.createElement(listType);
	if (cssClass.length > 0 ) {
		listWrapper.classList.add(cssClass);
	}
    if (title.length > 0) {
        listWrapper.appendChild(createFieldTitle(title));    
    }
	for (const listItem of listItems) {
		addListOption(listElement, listItem);
	}
	listWrapper.appendChild(listElement);
	return listWrapper;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Lägg till en punkt i angiven HTML-lista
export function addListOption(listElement, text, url) {
	const listItem = document.createElement("li");
	if (url !== undefined) {
		const itemLink = document.createElement("a");
		itemLink.target = "_blank";
		itemLink.href = url;
		itemLink.innerHTML = ( getIsValidText(text) ? text : " - " );
		listItem.appendChild(itemLink);
	}
	else {
		listItem.innerHTML = ( getIsValidText(text) ? text : " - " );
	}
	listElement.appendChild(listItem);
	return listItem;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett grupperat checkbox-element 
export function createCheckboxOption(text, value, groupName) {
	const checkboxWrapper = document.createElement("div");
	const checkboxElem = document.createElement("input");
	const checkboxLabel = document.createElement("label");
	
	checkboxElem.type = "checkbox";
	checkboxElem.id = `genre-${value}`; 
	checkboxElem.value = value;
	checkboxElem.checked = true;
	checkboxElem.name = groupName;
	
	checkboxLabel.setAttribute("for", checkboxElem.id);	
	checkboxLabel.innerText = text;

	checkboxWrapper.classList.add("checkbox-wrapper");
	checkboxWrapper.append(checkboxElem, checkboxLabel);
	return checkboxWrapper;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett SVG-bildelement baserat på "points-image" template (i HTML-filen) för visning av betygspoäng
export function createMovieScorePointElement(isScored = false) {
    const newSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const newUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    newSVG.classList.add("points");
	if (isScored) {
		newSVG.classList.add("scored");
	}
    newUse.setAttribute("href", "#points-image");
    newSVG.appendChild(newUse);
    return newSVG;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett textelement med hyperlänk och en rubrik
export function createLinkField(title, text, url, cssClass = '') {
	const linkField = document.createElement("div");
	const linkElem = document.createElement("a");
	if (cssClass.length > 0 ) {
		linkField.classList.add(cssClass);
	}
    if (title.length > 0) {
        linkField.appendChild(createFieldTitle(title));    
    }

	if (url !== null) {
		linkElem.target = "_blank";
		linkElem.href = url;
		linkElem.innerText = (getIsValidText(text) ? text : "Click here");
		linkField.appendChild(linkElem);
	}
	else {
		const noLinkElem = document.createElement("span");
		noLinkElem.innerText = " - ";
		linkField.appendChild(noLinkElem);
	}

	return linkField;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett nyskapat container-element med angivet ID och ev. klasser
export function createWrapperBox(parentContainer, elementID, cssClass = '', elementType = 'div') {
	const wrapperBox = document.createElement(elementType);
	if ((elementID !== undefined) && (elementID.length > 0)) {
		wrapperBox.id = elementID;
	}
	if (cssClass.length > 0 ) {
		if (Array.isArray(cssClass)) {
			wrapperBox.classList.add(...cssClass);
		}
		else {
			wrapperBox.classList.add(cssClass);
		}	
	}
	if (parentContainer !== undefined) {
		parentContainer.appendChild(wrapperBox);
	}
	return wrapperBox;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Animera element med angiven klass så de tonas in och växer till full bredd.
export function animateFlipInElements(elemClass) {
	anime({
		targets: `.${elemClass}`,
		duration: 500,
		easing: 'linear', 
		autoplay: true,
		delay: anime.stagger(50), 
		opacity: [
			{value: '0', duration: 0, easing: 'linear'},
			{value: '1', easing: 'linear'},
		],
		scaleX: [
			{value: '0%', duration: 0, easing: 'linear'},
			{value: '100%', easing: 'linear'},
		],
	});
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Animera element med angiven klass så de tonas in från genomskinlig grå till guld
export function animateFadeInScoreElements(elemClass) {
	anime({
		targets: `.${elemClass}`,
		duration: 1000,
		easing: 'easeInQuint', 
		autoplay: true,
		delay: anime.stagger(100), 
		opacity: [
			{value: '0.2', duration: 0, easing: 'linear'},
			{value: '1', easing: 'easeInQuint'},
		],
		fill: [
			{value: 'rgb(255,255,255)', duration: 0, easing: 'linear'},
			{value: 'rgb(255, 215, 0', easing: 'easeInQuint'},
		]
	});
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Kontrollera om angiven parameter är en giltig textsträng av tillräcklig längd
export function getIsValidText(text, minLength = 0) {
	return (text !== undefined) && (text !== null) && (text.length > minLength);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Kontrollera om angiven parameter är ett giltigt nummer
export function getIsValidNumber(number) {
	return (number !== undefined) && (number !== null) && !isNaN(number);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera en version av text nedklippt till angivet max antal tecken om den är längre. 
export function getTruncatedText(truncText, maxLength) {
	if (maxLength < truncText.length) {
		let cutOffLength = truncText.lastIndexOf(" ", maxLength);
		if (cutOffLength < 0) {
			cutOffLength = maxLength;
		}
		truncText = truncText.slice(0, Math.min(maxLength, cutOffLength)) + "…";
	}
	return truncText;
}