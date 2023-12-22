/*
    Slutprojekt (The Movie Database API) - FE23 Javascript 1
    Kristoffer Bengtsson

	Funktionalitet för att visa info om personer från The Movie Database API.
*/

import {fetchJSON} from '../modules/api.js';
import {createImageElement, createTextField, createFieldTitle, addListOption, createWrapperBox, createLinkField, animateFlipInElements} from '../modules/dom-utilities.js';
import {showMovieDetails} from '../modules/movie.js';

const imagesUrl = "https://image.tmdb.org/t/p/h632"; 


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Event-callback för att visa detaljerad info om en person vars ID är satt på "person-id" attributet
// på elementet som triggar eventet. 
function showPersonDetails(event) {
	event.preventDefault();

	const personId = parseInt(event.currentTarget.getAttribute("person-id"));
	if ((personId !== undefined) && (personId !== null) && !isNaN(personId)) {
		const requestURL = new URL(`https://api.themoviedb.org/3/person/${personId}`);
		fetchJSON(requestURL, (person) => {
			const detailsBox = document.querySelector("#details-dialog");
			getPersonDetailsCard(person, detailsBox);
			detailsBox.showModal();
		});
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera och infoga ett kort med detaljerad info om en person (DOM-element)
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

	// Poster
	personPhoto.appendChild(createImageElement(imagesUrl + person.profile_path, `Photo of ${person.name}`, '../images/no-photo.png'));

	// Info
	personInfo.appendChild(createFieldTitle(person.name, "h2", "details-name"));
	personInfo.appendChild(createTextField('', personBiography, "details-biography", true));
	personInfo.appendChild(createTextField('Known for', person.known_for_department, "details-knownfor"));
	personInfo.appendChild(createTextField('Birthplace', person.place_of_birth, "details-birthplace"));
	personInfo.appendChild(createLinkField('Home page', 'Visit home page', person.homepage, 'details-homepage'));

	// Stats
	personStats.appendChild(createTextField('Date of birth', person.birthday, "details-birthday")); 
	personStats.appendChild(createTextField('Date of death', person.deathday, "details-deathday"));
	personStats.appendChild(createTextField('Gender', personGender, "details-gender"));
	
	personStats.appendChild(createLinkField('', "IMDB", `https://www.imdb.com/name/${person.imdb_id}/`, "details-link"));
	
	return detailsBox;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Visa översikt över en samling filmer i angivet container-element
function displayPeopleList(people, container) {
	container.innerHTML = "";
	
	console.log(people.results);

	if (people.total_results > 0) {
		for (const person of people.results) {
      // Bygg absolut URL till porträtt-bilderna
			if ((person.profile_path !== undefined) && (person.profile_path !== null) && (person.profile_path.length > 5)) {
				person.profile_path = imagesUrl + person.profile_path;
			}
			container.appendChild(getPersonCard(person));
		}
		animateFlipInElements('card');
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Returnera ett DOM-element med ett info-kort om en person
function getPersonCard(person) {
	const personCard = createWrapperBox(undefined, '', ['card', 'card-person']);
	const personName = createFieldTitle(person.name, "h2");
	const personPhoto = createImageElement(person.profile_path, `Photo of ${person.name}`, '../images/no-photo.png');
	personCard.append(
		personPhoto, 
		personName, 
		createTextField("Profession", person.known_for_department), 
		createWorkHistoryList("Known from", person.known_for)
	);

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
			
			// Visa ruta med mer info om filmer om de klickas på i listan, för övriga typer länka till TMDB-sidan
			if (pastWork.media_type == "movie") {
				pastWorkOption.setAttribute("movie-id", pastWork.id);
				pastWorkOption.addEventListener("click", showMovieDetails);
			}
		}  
	}
	else {
		addListOption(historyList, " - ");  
	}
	
	historyBox.append(createFieldTitle(title), historyList);
	return historyBox;
}



/////////////////////////////////////////// TV SERIES INFO
/*
{
  "adult": false,
  "backdrop_path": "/3gRDZotvt7FqNyTU4bU9S2OCEPi.jpg",
  "created_by": [
    {
      "id": 189019,
      "credit_id": "57479bdb92514135c90006b2",
      "name": "Shelley Eriksen",
      "gender": 1,
      "profile_path": null
    },
    {
      "id": 1626547,
      "credit_id": "57479bd292514135c5000716",
      "name": "Tim Kilby",
      "gender": 2,
      "profile_path": null
    }
  ],
  "episode_run_time": [
    43
  ],
  "first_air_date": "2016-05-26",
  "genres": [
    {
      "id": 80,
      "name": "Crime"
    },
    {
      "id": 18,
      "name": "Drama"
    },
    {
      "id": 35,
      "name": "Comedy"
    }
  ],
  "homepage": "https://www.globaltv.com/shows/private-eyes/",
  "id": 66599,
  "in_production": false,
  "languages": [
    "en"
  ],
  "last_air_date": "2021-08-26",
  "last_episode_to_air": {
    "id": 3141019,
    "name": "Queen's Gambit",
    "overview": "A simple robbery case at a local drag club ends up being more complicated than expected. As Shade and Angie race to stop a bank heist, they admire their clients' ability to be true to themselves and express their feelings.",
    "vote_average": 0,
    "vote_count": 0,
    "air_date": "2021-08-26",
    "episode_number": 8,
    "episode_type": "finale",
    "production_code": "",
    "runtime": 43,
    "season_number": 5,
    "show_id": 66599,
    "still_path": "/kmBmKC50OOe67lUTc4oDJmimpaj.jpg"
  },
  "name": "Private Eyes",
  "next_episode_to_air": null,
  "networks": [
    {
      "id": 218,
      "logo_path": "/lpB2tPkovzbAbYfyBjJjbptygfV.png",
      "name": "Global TV",
      "origin_country": "CA"
    }
  ],
  "number_of_episodes": 60,
  "number_of_seasons": 5,
  "origin_country": [
    "CA"
  ],
  "original_language": "en",
  "original_name": "Private Eyes",
  "overview": "Ex-pro hockey player Matt Shade irrevocably changes his life when he teams up with fierce P.I. Angie Everett to form an unlikely investigative powerhouse.",
  "popularity": 75.788,
  "poster_path": "/yPt9IuY2D8g6Lpwh8O8wCDixzt9.jpg",
  "production_companies": [
    {
      "id": 51848,
      "logo_path": "/jmrRZgqHnYmJC4uePQI2sLijpSk.png",
      "name": "Entertainment One Television",
      "origin_country": "CA"
    },
    {
      "id": 7224,
      "logo_path": "/aEB2TV6TTolC7NSwonWIb25MKga.png",
      "name": "Shaw Media",
      "origin_country": "CA"
    }
  ],
  "production_countries": [
    {
      "iso_3166_1": "CA",
      "name": "Canada"
    }
  ],
  "seasons": [
    {
      "air_date": "2016-06-09",
      "episode_count": 4,
      "id": 82800,
      "name": "Specials",
      "overview": "",
      "poster_path": null,
      "season_number": 0,
      "vote_average": 0
    },
    {
      "air_date": "2016-05-26",
      "episode_count": 10,
      "id": 77372,
      "name": "Season 1",
      "overview": "The original crime-solving series Private Eyes is a 10-episode procedural drama that follows ex-pro hockey player Matt Shade who irrevocably changes his life when he decides to team up with fierce P.I. Angie Everett to form an unlikely investigative powerhouse. Through their new partnership, Shade is forced to examine who he has become and who he wants to be. Ongoing episodes find Shade and Angie investigating high-stakes crimes in the worlds of horse racing, fine dining, Toronto's vibrant hip-hop scene, scandalous literature, magic clubs, and more.",
      "poster_path": "/nhEGIIqaSCLW5gZUD4D0AHEt1So.jpg",
      "season_number": 1,
      "vote_average": 7.5
    },
    {
      "air_date": "2017-05-25",
      "episode_count": 18,
      "id": 88367,
      "name": "Season 2",
      "overview": "Matt Shade irrevocably changed his life when he decided to team up with fierce PI Angie Everett. Now, this dynamic duo has found their rhythm both on and off the case. They still view the world through different lenses, but have learned to use each other’s strengths to their mutual advantage…mostly. With their new equal partnership comes a booming business, and they opt to hire an assistant in the form of quirky Zoe Chow.",
      "poster_path": "/7mQgUpXiRgzagfCVbZi906UN0SH.jpg",
      "season_number": 2,
      "vote_average": 8.4
    },
    {
      "air_date": "2019-05-29",
      "episode_count": 12,
      "id": 122731,
      "name": "Season 3",
      "overview": "Angie finds herself behind bars and it is up to her trusted partner to bail Angie out so they can work together to recover the sensitive government intel and prove her innocence. Leveraging each other’s strengths, and the quirky skillset of their assistant Zoe Chow, Shade and Angie strive to get their reputation back on track. Along the way, the detective duo discover that their partnership may go beyond the agency’s confines…",
      "poster_path": "/rmzAY4VDRW8NyQidZarrbijkERW.jpg",
      "season_number": 3,
      "vote_average": 10
    },
    {
      "air_date": "2020-11-02",
      "episode_count": 12,
      "id": 166528,
      "name": "Season 4",
      "overview": "Season 4 picks up following a paternity bombshell dropped in Matt Shade’s lap, presenting a sudden realization that family is far more complicated than he ever anticipated. Helping to keep him grounded is his partner, whip-smart PI Angie Everett, whose concern for Shade’s well-being involves a secret DNA test and more than a few white lies. Luckily, a pressing case becomes a welcome distraction from personal conflicts as Shade and Angie delve into the mystery of a wealthy family whose Gatsby-themed party becomes a setting for battles over inheritance…and murder.",
      "poster_path": "/yPt9IuY2D8g6Lpwh8O8wCDixzt9.jpg",
      "season_number": 4,
      "vote_average": 0
    },
    {
      "air_date": "2021-07-07",
      "episode_count": 8,
      "id": 200680,
      "name": "Season 5",
      "overview": "",
      "poster_path": "/pNKp0KinrCVifaYk1yYp4t7jf0s.jpg",
      "season_number": 5,
      "vote_average": 0
    }
  ],
  "spoken_languages": [
    {
      "english_name": "English",
      "iso_639_1": "en",
      "name": "English"
    }
  ],
  "status": "Canceled",
  "tagline": "",
  "type": "Scripted",
  "vote_average": 7.3,
  "vote_count": 120
}
*/
/////////////////////////////////////////// PERSON
/*

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZjlmZTVkYjM0MzY5NTMwMTUxNDAxZGNhZmMxNzhiMiIsInN1YiI6IjY1ODAwNWNkOGRiYzMzMDhiMDk5N2E5NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KIgUPg4AvT3idD6H0OUXoxmJdh26yFKIavJPi0oNBso'
  }
};

fetch('https://api.themoviedb.org/3/search/person?query=Harrison%20Ford&include_adult=false&language=en-US&page=1', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));




{
  "page": 1,
  "results": [
    {
      "adult": false,
      "gender": 2,
      "id": 3,
      "known_for_department": "Acting",
      "name": "Harrison Ford",
      "original_name": "Harrison Ford",
      "popularity": 49.925,
      "profile_path": "/zVnHagUvXkR2StdOtquEwsiwSVt.jpg",
      "known_for": [
        {
          "adult": false,
          "backdrop_path": "/8BTsTfln4jlQrLXUBquXJ0ASQy9.jpg",
          "id": 140607,
          "title": "Star Wars: The Force Awakens",
          "original_language": "en",
          "original_title": "Star Wars: The Force Awakens",
          "overview": "Thirty years after defeating the Galactic Empire, Han Solo and his allies face a new threat from the evil Kylo Ren and his army of Stormtroopers.",
          "poster_path": "/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg",
          "media_type": "movie",
          "genre_ids": [
            12,
            28,
            878
          ],
          "popularity": 148.764,
          "release_date": "2015-12-15",
          "video": false,
          "vote_average": 7.289,
          "vote_count": 18530
        },
        {
          "adult": false,
          "backdrop_path": "/eIi3klFf7mp3oL5EEF4mLIDs26r.jpg",
          "id": 78,
          "title": "Blade Runner",
          "original_language": "en",
          "original_title": "Blade Runner",
          "overview": "In the smog-choked dystopian Los Angeles of 2019, blade runner Rick Deckard is called out of retirement to terminate a quartet of replicants who have escaped to Earth seeking their creator for a way to extend their short life spans.",
          "poster_path": "/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg",
          "media_type": "movie",
          "genre_ids": [
            878,
            18,
            53
          ],
          "popularity": 59.907,
          "release_date": "1982-06-25",
          "video": false,
          "vote_average": 7.933,
          "vote_count": 12966
        },
        {
          "adult": false,
          "backdrop_path": "/c7Mjuip0jfHLY7x8ZSEriRj45cu.jpg",
          "id": 85,
          "title": "Raiders of the Lost Ark",
          "original_language": "en",
          "original_title": "Raiders of the Lost Ark",
          "overview": "When Dr. Indiana Jones – the tweed-suited professor who just happens to be a celebrated archaeologist – is hired by the government to locate the legendary Ark of the Covenant, he finds himself up against the entire Nazi regime.",
          "poster_path": "/ceG9VzoRAVGwivFU403Wc3AHRys.jpg",
          "media_type": "movie",
          "genre_ids": [
            12,
            28
          ],
          "popularity": 51.524,
          "release_date": "1981-06-12",
          "video": false,
          "vote_average": 7.927,
          "vote_count": 11672
        }
      ]
    },
    {
      "adult": false,
      "gender": 2,
      "id": 148815,
      "known_for_department": "Acting",
      "name": "Harrison Ford",
      "original_name": "Harrison Ford",
      "popularity": 3.279,
      "profile_path": "/1KSM8u8vBYCYybMOFxythVJPNqD.jpg",
      "known_for": [
        {
          "adult": false,
          "backdrop_path": "/ijp8v1EuRsr1lGkuEYvs89doVop.jpg",
          "id": 175693,
          "title": "Little Old New York",
          "original_language": "en",
          "original_title": "Little Old New York",
          "overview": "An Irish girl comes to America disguised as a boy to claim a fortune left to her brother who has died.",
          "poster_path": "/9sLKKwT0ng6kck00UXDhnXd1IIx.jpg",
          "media_type": "movie",
          "genre_ids": [
            35,
            10749
          ],
          "popularity": 2.848,
          "release_date": "1923-08-01",
          "video": false,
          "vote_average": 6.5,
          "vote_count": 10
        },
        {
          "adult": false,
          "backdrop_path": "/jQBB35mU5CdkngZODU0Sg5kYdA8.jpg",
          "id": 35227,
          "title": "Foolish Wives",
          "original_language": "en",
          "original_title": "Foolish Wives",
          "overview": "A con artist masquerades as Russian nobility and attempts to seduce the wife of an American diplomat.",
          "poster_path": "/q8HI0WqwLKY2O1JYyFUF9awi3br.jpg",
          "media_type": "movie",
          "genre_ids": [
            18,
            53
          ],
          "popularity": 12.979,
          "release_date": "1922-01-11",
          "video": false,
          "vote_average": 6.6,
          "vote_count": 75
        },
        {
          "adult": false,
          "backdrop_path": "/gL7MBmSCn8QTCLucr39m2as8ROq.jpg",
          "id": 64860,
          "title": "Shadows",
          "original_language": "en",
          "original_title": "Shadows",
          "overview": "Yen Sin, a humble Chinese, is washed ashore after a storm and finds himself an outsider in the deeply Christian fishing community of Urkey. Yen Sin elects to stay, despite his status as a despised 'heathen', only to reveal hypocrisy amid the self-righteous township.",
          "poster_path": "/n6BBPHbIhYxYB9AEz2C2PrL5n7k.jpg",
          "media_type": "movie",
          "genre_ids": [
            18
          ],
          "popularity": 4.043,
          "release_date": "1922-11-10",
          "video": false,
          "vote_average": 6.1,
          "vote_count": 14
        }
      ]
    },
    {
      "adult": false,
      "gender": 2,
      "id": 2243361,
      "known_for_department": "Acting",
      "name": "Dwight Forde",
      "original_name": "Dwight Forde",
      "popularity": 0.6,
      "profile_path": "/hbWYXOUtbOzBDvu4QUyn8IEIXtB.jpg",
      "known_for": [
        {
          "adult": false,
          "backdrop_path": "/pcxwgJb65P1tSXV2KWm5QwJGHSU.jpg",
          "id": 85586,
          "name": "Coroner",
          "original_language": "en",
          "original_name": "Coroner",
          "overview": "Jenny Cooper investigates unexplained or sudden deaths in the city of Toronto. Fierce and quick-witted, Jenny is a newly-widowed single mother with secrets of her own to unearth.",
          "poster_path": "/7zEVxcNEDxVtRf29zvjjy6cazm4.jpg",
          "media_type": "tv",
          "genre_ids": [
            18,
            80,
            9648
          ],
          "popularity": 38.285,
          "first_air_date": "2019-01-07",
          "vote_average": 7.1,
          "vote_count": 214,
          "origin_country": [
            "CA"
          ]
        },
        {
          "adult": false,
          "backdrop_path": "/3gRDZotvt7FqNyTU4bU9S2OCEPi.jpg",
          "id": 66599,
          "name": "Private Eyes",
          "original_language": "en",
          "original_name": "Private Eyes",
          "overview": "Ex-pro hockey player Matt Shade irrevocably changes his life when he teams up with fierce P.I. Angie Everett to form an unlikely investigative powerhouse.",
          "poster_path": "/yPt9IuY2D8g6Lpwh8O8wCDixzt9.jpg",
          "media_type": "tv",
          "genre_ids": [
            80,
            18,
            35
          ],
          "popularity": 126.314,
          "first_air_date": "2016-05-26",
          "vote_average": 7.3,
          "vote_count": 120,
          "origin_country": [
            "CA"
          ]
        },
        {
          "adult": false,
          "backdrop_path": "/5i3a2mDiMSqbFbEZBR5Azss9fKj.jpg",
          "id": 580341,
          "title": "Goalie",
          "original_language": "en",
          "original_title": "Goalie",
          "overview": "The life of a professional hockey player was not always a glamorous one. For legendary goaltender Terry Sawchuk, each save means one more gash to his unmasked face and one more drink to numb the pain. Sawchuk traveled across the country racking up 103 shutouts and 400 stitches to his face, proving that this is a man who lives, breathes, and dies a goalie.",
          "poster_path": "/7QBmU0lt5RTX6zlmhiCoVuRE5zN.jpg",
          "media_type": "movie",
          "genre_ids": [
            18
          ],
          "popularity": 3.899,
          "release_date": "2019-03-01",
          "video": false,
          "vote_average": 7,
          "vote_count": 4
        }
      ]
    },
    {
      "adult": false,
      "gender": 2,
      "id": 1491583,
      "known_for_department": "Acting",
      "name": "Harry M. Ford",
      "original_name": "Harry M. Ford",
      "popularity": 1.709,
      "profile_path": null,
      "known_for": [
        {
          "adult": false,
          "backdrop_path": "/AekZz93QCISOYFELhxyRCSzcAit.jpg",
          "id": 63418,
          "name": "Code Black",
          "original_language": "en",
          "original_name": "Code Black",
          "overview": "Inspired by the award-winning documentary, this medical drama is set in the busiest and most notorious ER in the nation where the extraordinary staff confront a challenged system in order to protect their ideals and the patients who need them the most.",
          "poster_path": "/xUpISrmAGP4ZglmluNI8a0ENXyS.jpg",
          "media_type": "tv",
          "genre_ids": [
            18
          ],
          "popularity": 69.978,
          "first_air_date": "2015-09-30",
          "vote_average": 7.754,
          "vote_count": 242,
          "origin_country": [
            "US"
          ]
        },
        {
          "adult": false,
          "backdrop_path": "/pwTp9JkhPKbKnYu9vCoYgAZO3Mw.jpg",
          "id": 157827,
          "title": "Louder Than Bombs",
          "original_language": "en",
          "original_title": "Louder Than Bombs",
          "overview": "Three years after his wife, acclaimed photographer Isabelle Reed, dies in a car crash, Gene keeps everyday life going with his shy teenage son, Conrad. A planned exhibition of Isabelle’s photographs prompts Gene's older son, Jonah, to return to the house he grew up in - and for the first time in a very long time, the father and the two brothers are living under the same roof.",
          "poster_path": "/26hoecTKEAXswDwk4nUE4SEcPg2.jpg",
          "media_type": "movie",
          "genre_ids": [
            18
          ],
          "popularity": 21.392,
          "release_date": "2015-10-01",
          "video": false,
          "vote_average": 6.5,
          "vote_count": 297
        }
      ]
    }
  ],
  "total_pages": 1,
  "total_results": 4
}
*/





export {displayPeopleList, getPersonCard};