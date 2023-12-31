/*
    Slutprojekt (The Movie Database API) - FE23 Javascript 1
    Kristoffer Bengtsson

	Funktionalitet för att hämta information från API.
    https://developer.themoviedb.org/reference/intro/getting-started
*/

// TMDB API-nyckel
const apiKey = "ff9fe5db34369530151401dcafc178b2";

// Funktion för visning av felmeddelanden, kan ändras genom setAPIErrorDisplayFunction()
let displayErrorMessage = console.log;


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Hämta information från API och skicka till callback-funktion
async function fetchJSON(url, callbackFunc, errorMessageOverride = '') {
    try {
        // Om url-parametern är en sträng, gör om till URL-objekt...
        if (!(url instanceof URL) && (typeof url == "string") && (url.length > 0)) {
            url = new URL(url);
        }

        // Skicka med API-nyckeln
        url.searchParams.append("api_key", apiKey);

        // Skicka förfrågan
        const response = await fetch(url);
        if (!response.ok)
            throw new MovieAPIError(response.statusText, response.status);

        const result = await response.json();
        if (typeof callbackFunc == "function") {
            callbackFunc(result);
        }
        return result;
    }
    catch (error) {
        errorHandlerAPI(error, errorMessageOverride);
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Felhanterare för API-anrop
function errorHandlerAPI(error, errorMessageOverride) {
    if (errorMessageOverride.length > 0) {
        displayErrorMessage(errorMessageOverride);
        console.error("Actual error:", error);
    }
    else if (error instanceof MovieAPIError) {
        switch (error.statusCode) {
            case 400: displayErrorMessage("The specified search criteria is invalid. Please check your input and try again."); break;
            case 401: displayErrorMessage("You are currently not allowed to access The Movie Database. Please try again later."); break;
            case 404: displayErrorMessage("The specified criteria could not be found."); break;
            case 429: displayErrorMessage("Too many requests in a short time. Please wait a while before trying again."); break;
            case 503: displayErrorMessage("The Movie Database is currently unavailable. Try again later?"); break;
            default: displayErrorMessage("An error occurred when accessing The Movie Database. Try again?"); break;
        }
        console.error("MovieAPI Error:", error.errorCode, error.message);
    }
    else {
        displayErrorMessage("An error occurred while fetching information from The Movie Database. Try again?");
        console.error("General error:", error);
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Ange funktion som skall användas för att visa felmeddelande för användaren
function setAPIErrorDisplayFunction(displayFunction) {
    displayErrorMessage = displayFunction;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Exception-klass för att separera statuskod och felmeddelande för response-fel vid API-anrop
class MovieAPIError extends Error {
    statusCode = 0;
    constructor(message, errorCode) {
        super(message);
        this.statusCode = errorCode;
    }
}


export {fetchJSON, setAPIErrorDisplayFunction};