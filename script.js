console.log("Test")
const API_URL = "https://www.giantbomb.com/api/";
const API_GAMES = "games/";
const API_PLATFORMS = "platforms/"
const API_KEY = "7a29a0a7f45e106ee6a5aa46aba6feee440588b1";
const API_TO_JSON = "format=json";

var mesJeux;

var theme;

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
	if (globalPlatforms) return globalPlatforms;

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
	
	const favButton = document.querySelector(".favButton");
	if (!favButton) {
		throw new Error("favButton introuvable");
	}
	favButton.addEventListener("click", displayFav);

	const themeButton = document.querySelector(".themeButton");
	if (!themeButton) {
		throw new Error("themeButton introuvable");
	}
	themeButton.addEventListener("click", switchTheme);

	mesJeux = chargerMesJeux();

	theme = chargerThemeStocke();
	sauvegarderTheme();
}

window.onload = init;

class Jeu {
	name;
	image;
	image_small;
	platforms;
	divCustom;
	alreadyReleased;
	date;
	shortDesc;
	longDesc;

	constructor(jeu, sectionPage, fromStorage){
		if (!fromStorage){
			this.image = jeu.image.screen_url;
			this.image_small = jeu.image.small_url;

			if (jeu.original_release_date != null){
				this.date = jeu.original_release_date;
				this.alreadyReleased = true;
			} else {
				this.alreadyReleased = false;
				if (jeu.expected_release_year != null) {
					this.date = jeu.expected_release_year;
				} else {
					this.date = "Date de sortie inconnue"
				}
			}

			if (jeu.deck != null) {
				this.shortDesc = jeu.deck;
			} else {
				this.shortDesc = 'Pas de résumé disponible.';
			}
			
			if (jeu.description != null) {
				this.longDesc = jeu.description;
			} else {
				this.longDesc = "Pas de description disponible";
			}
		} else {
			this.image = jeu.image;
			this.image_small = jeu.image_small;
			this.alreadyReleased = jeu.alreadyReleased;
			this.date = jeu.date;
			this.shortDesc = jeu.shortDesc;
			this.longDesc = jeu.longDesc;
		}
		this.name = jeu.name;
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

async function displayFav(){
	const sectionPage = document.querySelector(".sectionPage");
	// Generate HTML from game list

	if (mesJeux.size > 0){

		displayLoader(sectionPage);

		globalPlatforms = await loadPlatforms();

		console.log(globalPlatforms);
		
		sectionPage.innerHTML = '';

		let currBigDiv;

		let i = 0;

		mesJeux.forEach(unJeu =>{
			if (i%3 == 0){
				currBigDiv = document.createElement('div');
				currBigDiv.classList.add("multiGameDiv");
				sectionPage.append(currBigDiv);
			}
			i++;

			let jeu = new Jeu(unJeu, sectionPage, true);
	
			let newDiv = jeu.divCustom.div;
	
			currBigDiv.append(newDiv);
		});
	

	} else {
		sectionPage.innerHTML = `<div>
									<h2> C'est vide ici, ajoutez des favoris pour qu'ils apparaissent! </h2>
								</div>`;
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

	let gameDiv = document.createElement('div');
	gameDiv.classList.add("gamePage");

	let platforms_html = generatePlatformHTML(jeu.platforms);

	let releaseTxt = jeu.alreadyReleased ? "Sortie : " : "Sortie prévue : ";

	gameDiv.innerHTML = `
		<div class='topRow'>
			<h2> ${jeu.name} </h2>
			<img src='${jeu.image_small}'>
		</div>
		<div class='secondRow'>
			<div>
				${platforms_html}
			</div>
			<p> ${releaseTxt}
			<br>
			${jeu.date}
			</p>
		</div>
		<div class='shortDescRow'>
			<p> ${jeu.shortDesc} </p>
		</div>
		<div class='longDescRow'>
			<p> ${jeu.longDesc} </p>
		</div>

	`

	let addFavButton = document.createElement('button');
	addFavButton.classList.add("bouton");
	addFavButton.classList.add("addFavButton");

	const addToFav = "Ajouter aux favoris";
	const rmFromFav = "Retirer des favoris";

	addFavButton.innerHTML = jeuDansFavoris(jeu) ? rmFromFav : addToFav;

	addFavButton.onclick = () => {
		let dansFav = jeuDansFavoris(jeu);
		if (dansFav){
			retirerDesFavoris(jeu);
			addFavButton.innerHTML = addToFav;
		} else {
			ajouterAuxFavoris(jeu);
			addFavButton.innerHTML = rmFromFav;
		}
		displayPopup(dansFav, sectionPage);
	}

	gameDiv.append(addFavButton);

	sectionPage.append(gameDiv);

}

function displayPopup(dansFav, sectionPage){
	let txt = dansFav ? "Le jeu a bien été supprimé des favoris." : "Le jeu a été ajouté aux favoris.";

	let popup = document.createElement('div');
	popup.classList.add("popup");

	popup.innerHTML =  `<div class='popup-content'>
							<span class="close">&times;</span>
							<p> ${txt} </p>
						</div>`;
	

	sectionPage.append(popup);

	let closeBtn = document.querySelector(".close");
	closeBtn.onclick = () => {
		popup.remove();
	}
}


function jeuDansFavoris(jeu){
	return mesJeux.has(jeu.name);
}


function ajouterAuxFavoris(jeu){
	console.log("Ajouter aux favoris",jeu);
	mesJeux.set(jeu.name, jeu);
	console.log(mesJeux);
	sauvegarderMesJeux();
}

function retirerDesFavoris(jeu){
	mesJeux.delete(jeu.name);
	sauvegarderMesJeux();
}


function sauvegarderMesJeux(){
	const tableauMesJeux = Array.from(mesJeux.values());
	window.localStorage.setItem("mesJeux", JSON.stringify(tableauMesJeux));
}

function chargerMesJeux(){
	mesJeux = new Map();
	const json = window.localStorage.getItem("mesJeux");
	if (json) {
		const jeux = JSON.parse(json);
		jeux.forEach(unJeu=>{
			mesJeux.set(unJeu.name, unJeu);
		});
	}
	console.log(mesJeux);
	return mesJeux;
}

function chargerThemeStocke(){
	theme = 'light';
	const json = window.localStorage.getItem("theme");
	if (json) {
		const storedTheme = JSON.parse(json);
		theme = storedTheme == 'light' || storedTheme == 'dark' ? storedTheme : theme;
	}
	console.log(theme);
	return theme;
}

function sauvegarderTheme(){
	document.documentElement.setAttribute("data-theme", theme);
	window.localStorage.setItem("theme", JSON.stringify(theme));
}


function switchTheme(){
	theme = theme == 'light' ? 'dark' : 'light';
	sauvegarderTheme(); 
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

