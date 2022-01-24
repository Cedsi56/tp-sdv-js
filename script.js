console.log("Test")
const API_URL = "https://www.giantbomb.com/api/";
const API_GAMES = "games/";
const API_PLATFORMS = "platforms/"
const API_KEY = "7a29a0a7f45e106ee6a5aa46aba6feee440588b1";
const API_TO_JSON = "format=json";

async function fetchGameList(){

	const myInput = document.getElementById('searchInput').value;

	const platforms = await loadPlatforms();

	console.log(platforms);

    const fetchStr = `${API_URL}${API_GAMES}?api_key=${API_KEY}&${API_TO_JSON}&filter=aliases:${myInput}`;

    console.log(fetchStr);

    const resListeFetch = await fetch(fetchStr);

    console.log(resListeFetch);

    const jsonRequeteListe = await resListeFetch.json();

    console.log(jsonRequeteListe);

	const listeJeux = jsonRequeteListe.results;
    
	console.log(listeJeux);

	const sectionPage = document.querySelector(".sectionPage");

	let openedDiv = false;

	let new_html = '';

	for (let i = 0; i < listeJeux.length; i++){

		if (i%3 == 0){
			if (openedDiv){
				new_html += `</div>`;
			}
			new_html += `<div class='multiGameDiv'>`;
			openedDiv = true;
		}

		let platforms_html = '<div>';

		let too_many_plats = false;

		for (let j = 0; j < listeJeux[i].platforms.length; j++){

			if (j >= 4){
				let remaining = listeJeux[i].platforms.length - j;
				platforms_html += `</div><a>+ ${remaining} autres</a>`;
				too_many_plats = true;
				break;
			}

			platforms_html += `<img src='${platforms[listeJeux[i].platforms[j].name]}' alt='${listeJeux[i].platforms[j].name}'
			title='${listeJeux[i].platforms[j].name}'>`
		}

		if (!too_many_plats){
			platforms_html += '</div>';
		}
		
		new_html +=
			`<div class='flexBordered gameDiv'>
				<img src='${listeJeux[i].image.screen_url}'>
				${platforms_html}
				<p> ${listeJeux[i].name} </p>
			</div>`;

	}

	if (openedDiv){
		new_html += `</div>`;
	}

	sectionPage.innerHTML = new_html;

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

