/*
    Slutprojekt (The Movie Database API) - FE23 Javascript 1
    Kristoffer Bengtsson

	Funktionalitet för att hämta information från API.
*/

const apiToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZjlmZTVkYjM0MzY5NTMwMTUxNDAxZGNhZmMxNzhiMiIsInN1YiI6IjY1ODAwNWNkOGRiYzMzMDhiMDk5N2E5NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KIgUPg4AvT3idD6H0OUXoxmJdh26yFKIavJPi0oNBso";
let displayErrorMessage = logErrorMessage;


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Hämta information från API och skicka till callback-funktion
async function fetchJSON(url, callbackFunc, errorFunc = errorHandlerDefault) {
    try {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiToken}`
            }
        };

        const response = await fetch(url, options);
        if (!response.ok)
            throw new MovieAPIError(response.statusText, response.status);

        const result = await response.json();
        if (typeof callbackFunc == "function") {
            callbackFunc(result);
        }
        return result;
    }
    catch (error) {
        errorFunc(error);
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Felhanterare för API-anrop
function errorHandlerDefault(error) {
    if (error instanceof MovieAPIError) {
        switch (error.statusCode) {
            case 400: displayErrorMessage("The specified search criteria is invalid. Please check your input and try again."); break;
            case 401: displayErrorMessage("You are currently not allowed to access The Movie Database. Please try again later."); break;
            case 404: displayErrorMessage("The specified search criteria could not be found."); break;
            case 429: displayErrorMessage("Too many requests in a short time. Please wait a while before trying again."); break;
            case 503: displayErrorMessage("The Movie Database is currently unavailable. Try again later?"); break;
            default: displayErrorMessage("An error occurred when accessing The Movie Database. Try again?"); break;
        }
        console.log("MovieAPIError", error.errorCode, error.message);
    }
    else {
        displayErrorMessage("An error occurred while fetching information from The Movie Database. Try again?");
        console.error("General error", error);
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Standardmetod för visning av felmeddelande om setAPIErrorDisplayFunction() ej anropats
function logErrorMessage(errorText) {
    console.log("Error!", errorText);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Sätt vilken funktion som skall användas för att visa felmeddelande för användaren
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


export {fetchJSON, setAPIErrorDisplayFunction, MovieAPIError};