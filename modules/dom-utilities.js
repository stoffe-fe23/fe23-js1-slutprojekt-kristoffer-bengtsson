/*
	Slutprojekt (The Movie Database API) - FE23 Javascript 1
	Kristoffer Bengtsson

	Gemensamma verktygsfunktioner för att skapa DOM-element för visning av film/person-info.

	Använder anime.js för animation av visning av kort och betygspoäng.
	https://animejs.com/
*/

import anime from '../lib/anime.es.js';


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett nytt bild-element
export function createImageElement(url, text, placeholderImage, cssClass = '', link = null) {
	const imageElement = document.createElement("img");
	imageElement.alt = (getIsValidText(text) ? text : "No description");
	imageElement.src = (getIsValidText(url, 10) ? url : placeholderImage);
	addClassToElement(imageElement, cssClass);
	if (link !== null) {
		const imageLink = document.createElement("a");
		imageLink.href = link;
		imageLink.appendChild(imageElement);
		addClassToElement(imageLink, 'card-image-link');
		return imageLink;
	}
	return imageElement;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett nytt text-element med en rubrik
export function createTextField(title, text, cssClass = '', allowHTML = false) {
	const textField = document.createElement("div");
	addClassToElement(textField, cssClass);
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
// Returnera ett nytt rubrik-element av angiven rubriksnivå
export function createFieldTitle(text, type = "h3", cssClass = '') {
	const fieldTitle = document.createElement(type);
	fieldTitle.innerText = (getIsValidText(text) ? text : "Untitled");
	addClassToElement(fieldTitle, cssClass);
	return fieldTitle;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera en ny HTML-lista med en rubrik
export function createListField(title, listItems, cssClass = '', listType = 'ul') {
	const listWrapper = document.createElement("div");
	const listElement = document.createElement(listType);
	addClassToElement(listWrapper, cssClass);
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
		itemLink.innerHTML = (getIsValidText(text) ? text : " - ");
		listItem.appendChild(itemLink);
	}
	else {
		listItem.innerHTML = (getIsValidText(text) ? text : " - ");
	}
	listElement.appendChild(listItem);
	return listItem;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett nytt namn-grupperat checkbox-element 
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
export function createRatingScorePointElement(isScored = false) {
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
// Returnera ett nytt hyperlänkat textelement med rubrik
export function createLinkField(title, text, url, cssClass = '') {
	const linkField = document.createElement("div");
	const linkElem = document.createElement("a");
	addClassToElement(linkField, cssClass);

	if (title.length > 0) {
		linkField.appendChild(createFieldTitle(title));
	}

	if (getIsValidText(url, 4)) {
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
// Returnera ett nytt container-element
export function createWrapperBox(parentContainer, elementID, cssClass = '', elementType = 'div') {
	const wrapperBox = document.createElement(elementType);
	if ((elementID !== undefined) && (elementID.length > 0)) {
		wrapperBox.id = elementID;
	}
	addClassToElement(wrapperBox, cssClass);
	if (parentContainer !== undefined) {
		parentContainer.appendChild(wrapperBox);
	}
	return wrapperBox;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Animera element med angiven klass så de tonas in och växer ut till full bredd.
export function animateFlipInElements(elemClass) {
	anime({
		targets: `.${elemClass}`,
		duration: 500,
		easing: 'linear',
		autoplay: true,
		delay: anime.stagger(50),
		opacity: [
			{ value: '0', duration: 0, easing: 'linear' },
			{ value: '1', easing: 'linear' },
		],
		scaleX: [
			{ value: '0%', duration: 0, easing: 'linear' },
			{ value: '100%', easing: 'linear' },
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
			{ value: '0.2', duration: 0, easing: 'linear' },
			{ value: '1', easing: 'easeInQuint' },
		],
		fill: [
			{ value: 'rgb(255,255,255)', duration: 0, easing: 'linear' },
			{ value: 'rgb(255, 215, 0', easing: 'easeInQuint' },
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
// Returnera en sträng nedklippt till angivet max antal tecken (utan att klippa mitt i ord)
export function getTruncatedText(truncText, maxLength) {
	if (maxLength < truncText.length) {
		let cutOffLength = truncText.lastIndexOf(" ", maxLength);
		if (cutOffLength < 1) {
			cutOffLength = maxLength;
		}
		truncText = truncText.slice(0, cutOffLength) + "…";
	}
	return truncText;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Lägg till CSS-klass(er) till ett element
function addClassToElement(targetElement, classesToAdd) {
	if (classesToAdd.length > 0) {
		if (Array.isArray(classesToAdd)) {
			targetElement.classList.add(...classesToAdd);
		}
		else if (getIsValidText(classesToAdd)) {
			targetElement.classList.add(classesToAdd);
		}
	}
}