console.log("Test")
const API_URL = "https://www.giantbomb.com/api/";
const API_GAMES = "games/";
const API_PLATFORMS = "platforms/"
const API_KEY = "7a29a0a7f45e106ee6a5aa46aba6feee440588b1";
const API_TO_JSON = "format=json";

var globalPlatforms;

function generatePlatformHTML(gamePlatforms){
	let platforms_html = '<div>';

	let too_many_plats = false;

	if (gamePlatforms != null) {

		for (let j = 0; j < gamePlatforms.length; j++){

			if (j >= 4){
				let remaining = gamePlatforms.length - j;
				platforms_html += `</div><a>+ ${remaining} autres</a>`;
				too_many_plats = true;
				break;
			}

			platforms_html += `<img src='${globalPlatforms[gamePlatforms[j].name]}' alt='${gamePlatforms[j].name}'
								title='${gamePlatforms[j].name}'>`
		}

		if (!too_many_plats){
			platforms_html += '</div>';
		}

	} else {
		platforms_html += '<a> Aucune plateforme trouvée </a></div>';
	}

	return platforms_html;
}

async function fetchGameList(){

	const sectionPage = document.querySelector(".sectionPage");

	displayLoader(sectionPage);

	const myInput = document.getElementById('searchInput').value;

	globalPlatforms = await loadPlatforms();

	console.log(globalPlatforms);

    const fetchStr = `${API_URL}${API_GAMES}?api_key=${API_KEY}&${API_TO_JSON}&filter=name:${myInput}`;

    console.log(fetchStr);

    const resListeFetch = await fetch(fetchStr);

    console.log(resListeFetch);

    const jsonRequeteListe = await resListeFetch.json();

    console.log(jsonRequeteListe);

	const listeJeux = jsonRequeteListe.results;
    
	console.log(listeJeux);

	// Generate HTML from game list

	sectionPage.innerHTML = '';

	let currBigDiv;

	for (let i = 0; i < listeJeux.length; i++){

		if (i%3 == 0){
			currBigDiv = document.createElement('div');
			currBigDiv.classList.add("multiGameDiv");
			sectionPage.append(currBigDiv);
		}

		let jeu = new Jeu(listeJeux[i], sectionPage);

		let newDiv = jeu.divCustom.div;

		currBigDiv.append(newDiv);

	}


	console.log(listeJeux.length);
}

async function loadPlatforms(){
	let platforms = {};

	let offset = -100;

	let jsonRequeteListe;

	let id = 0;

	do {
		offset += 100;

		const fetchStr = `${API_URL}${API_PLATFORMS}?api_key=${API_KEY}&${API_TO_JSON}&offset=${offset}`;

		const resListeFetch = await fetch(fetchStr);

		jsonRequeteListe = await resListeFetch.json();

		const listePlat = jsonRequeteListe.results;

		for (let i = 0; i < listePlat.length; i++){
			platforms[listePlat[i].name] = listePlat[i].image.icon_url; 
			id++;
		}
	
	} while (offset + jsonRequeteListe.number_of_page_results < jsonRequeteListe.number_of_total_results);

	return platforms;
}



let init = () => {
    const sectionPage = document.querySelector(".sectionPage");
	if (!sectionPage) {
		throw new Error("sectionPage introuvable");
	}
	const searchButton = document.querySelector(".searchButton");
	if (!searchButton) {
		throw new Error("searchButton introuvable");
	}
	searchButton.addEventListener("click", fetchGameList);
}

window.onload = init;

class Jeu {
	name;
	image;
	image_small;
	platforms;
	divCustom;
	constructor(jeu, sectionPage){
		this.name = jeu.name;
		this.image = jeu.image.screen_url;
		this.image_small = jeu.image.small_url;
		this.platforms = jeu.platforms;


		let onclick = function(jeu) {
			displayGame(sectionPage, jeu);
		}

		this.divCustom = new DivSelectionJeu(this, onclick);
	}
}

class DivSelectionJeu {
	div;

	constructor(jeu, callbackClick) {
		const divJeu = document.createElement("div");
		divJeu.classList.add("gameDiv");
		divJeu.classList.add("flexBordered");

		let premiereLigne = `<img src='${jeu.image}'>`;
		let deuxiemeLigne = generatePlatformHTML(jeu.platforms);
		let troisiemeLigne = `<p> ${jeu.name} </p>`;


		divJeu.innerHTML = `
			${premiereLigne}
			${deuxiemeLigne}
			${troisiemeLigne}
		`;



		if (callbackClick) {
			divJeu.onclick = () => {
				callbackClick(jeu);
			};
		}
		this.div = divJeu;
	}
}

function displayLoader(sectionPage){
	sectionPage.innerHTML = "";
	const loader = document.createElement("div");
	loader.classList.add("loader");
	
	sectionPage.append(loader);
}


function displayGame(sectionPage, jeu){
	sectionPage.innerHTML = "";

	gameDiv = document.createElement('div');
	gameDiv.classList.add("gamePage");

	let platforms_html = generatePlatformHTML(jeu.platforms);

	gameDiv.innerHTML = `
		<div class='topRow'>
			<p> ${jeu.name} </p>
			<img src='${jeu.image_small}'>
		</div>
		<div class='secondRow'>
			${platforms_html}
			<p> Date! </p>
		</div>
		<div class='shortDescRow'>
			<p> Lorem ipsum </p>
		</div>
		<div class='longDescRow'>
			<p> Lorem ipsum blabla dksjhffjsdh dfsjkhfdlh fdkdhslkjf fsdljdslk dslkjdflkj</p>
		</div>
	`

	sectionPage.append(gameDiv);

}
























// fallbackFetchGiantBomb

(function() {
	const fetchOriginal = window.fetch;
	window.fetch = (input, init)=>{
		if (input.includes("giantbomb")) {
			return fetchGiantBomb(input);
		} else {
			return fetchOriginal(input, init);
		}
	};

	/**
	 *
	 * @param url
	 * @returns {Promise<Response>}
	 */
	const fetchGiantBomb = (url, init)=>{
		return new Promise((resolve, reject)=>{
			const urlJsonP = url.replace(/format=json([^p])|format=json$/, "format=jsonp$1");
			const urlFinale = urlJsonP + "&json_callback=callbackFetchGiantBomb";

			//TODO : REPLACE JSON PAR JSONP
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = urlFinale;

			const reinit = ()=>{
				script.remove();
				delete window.callbackFetchGiantBomb;
				window.removeEventListener("error", callbackError);
			};
			const callbackError = (e)=>{
				if (e.filename && e.filename.includes("callbackFetchGiantBomb")) {
					e.preventDefault();
					reinit();
					reject();
				}
			};

			window.addEventListener("error", callbackError);

			window.callbackFetchGiantBomb = (data)=>{
				const response = new Response();
				let bodyConsomme = false;
				response.json = async ()=>{
					if (bodyConsomme) {
						throw new Error("Response.json: Body has already been consumed.")
					}
					bodyConsomme = true;
					return data;
				};
				response.text = async ()=>{
					if (bodyConsomme) {
						throw new Error("Response.text: Body has already been consumed.")
					}
					bodyConsomme = true;
					return JSON.stringify(data);
				}
				reinit();
				resolve(response);
			};

			document.querySelector('head').append(script);
		});
	}
})();

