/*
    Slutprojekt (The Movie Database API) - FE23 Javascript 1
    Kristoffer Bengtsson

	Generella verktygsfunktioner för att skapa DOM-element.
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
// Returnera en onumrerad lista med en rubrik
export function createListField(title, listItems, cssClass = '') {
	const listWrapper = document.createElement("div");
	const listElement = document.createElement("ul");
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
// Lägg till ett element i angivet UL/OL-element
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
// Returnera ett option element för användning i select eller datalist-element
export function createDataOption(text, value) {
	const optionElem = document.createElement("option");
	optionElem.value = value;
	optionElem.innerText = text;
	return optionElem;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett grupperat checkbox-element 
export function createCheckboxOption(text, value, groupName) {
	const optionWrapper = document.createElement("div");
	const optionElem = document.createElement("input");
	const optionLabel = document.createElement("label");
	
	optionElem.type = "checkbox";
	optionElem.id = `genre-${value}`; 
	optionElem.value = value;
	optionElem.checked = true;
	optionElem.name = groupName;
	
	optionLabel.setAttribute("for", optionElem.id);	
	optionLabel.innerText = text;

	optionWrapper.classList.add("checkbox-wrapper");
	optionWrapper.append(optionElem, optionLabel);
	return optionWrapper;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett SVG-bildelement baserat på "points-image" template (i HTML) för visning av betygspoäng
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
// Returnera ett nyskapat DIV-element med angivet ID och ev. klass
export function createWrapperBox(parentContainer, elementID, cssClass = '') {
	const wrapperBox = document.createElement("div");
	if (elementID !== undefined) {
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
// Kontrollera om angiven parameter är en giltig text-variabel av tillräcklig längd
function getIsValidText(text, minLength = 0) {
	return (text !== undefined) && (text !== null) && (text.length > minLength);
}