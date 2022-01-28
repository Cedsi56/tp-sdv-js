class DivSelectionJeu {
	div;

	constructor(jeu, callbackClick) {
		const divJeu = document.createElement("div");
		divJeu.classList.add("gameDiv");
		divJeu.classList.add("flexBordered");

		let premiereLigne = `<img src='${jeu.image}'>`;
		let deuxiemeLigne = ListeJeux.generatePlatformHTML(jeu.platforms);
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
					this.date = "Date de sortie inconnue";
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
			ListeJeux.displayGame(sectionPage, jeu);
		};

		this.divCustom = new DivSelectionJeu(this, onclick);
	}
}

class DAO {

    static #mesJeux = new Map();

    static #theme;

    static globalPlatforms;

    static API_URL = "https://www.giantbomb.com/api/";
    static API_GAMES = "games/";
    static API_PLATFORMS = "platforms/"
    static API_KEY = "7a29a0a7f45e106ee6a5aa46aba6feee440588b1";
    static API_TO_JSON = "format=json";


    static getMesJeux(){
        return this.#mesJeux;
    }


    static jeuDansFavoris(jeu){
        return this.#mesJeux.has(jeu.name);
    }
    
    
    static ajouterAuxFavoris(jeu){
        this.#mesJeux.set(jeu.name, jeu);
        this.sauvegarderMesJeux();
    }
    
    static retirerDesFavoris(jeu){
        this.#mesJeux.delete(jeu.name);
        this.sauvegarderMesJeux();
    }
    
    
    static sauvegarderMesJeux(){
        const tableauMesJeux = Array.from(this.#mesJeux.values());
        window.localStorage.setItem("mesJeux", JSON.stringify(tableauMesJeux));
    }
    
    static chargerMesJeux(){
        this.#mesJeux = new Map();
        const json = window.localStorage.getItem("mesJeux");
        if (json) {
            const jeux = JSON.parse(json);
            jeux.forEach(unJeu=>{
                this.#mesJeux.set(unJeu.name, unJeu);
            });
        }
        return this.#mesJeux;
    }
    
    static chargerThemeStocke(){
        this.#theme = 'light';
        const json = window.localStorage.getItem("theme");
        if (json) {
            const storedTheme = JSON.parse(json);
            this.#theme = storedTheme == 'light' || storedTheme == 'dark' ? storedTheme : this.#theme;
        }
        return this.#theme;
    }
    
    static sauvegarderTheme(){
        document.documentElement.setAttribute("data-theme", this.#theme);
        window.localStorage.setItem("theme", JSON.stringify(this.#theme));
    }
    
    
    static switchTheme(){
        this.#theme = this.#theme == 'light' ? 'dark' : 'light';
        this.sauvegarderTheme(); 
    }

    static async loadPlatforms(){
        if (this.globalPlatforms) return this.globalPlatforms;
    
        let platforms = {};
    
        let offset = -100;
    
        let jsonRequeteListe;
    
        do {
            offset += 100;
    
            const fetchStr = `${this.API_URL}${this.API_PLATFORMS}?api_key=${this.API_KEY}&${this.API_TO_JSON}&offset=${offset}`;
    
            const resListeFetch = await fetch(fetchStr);
    
            jsonRequeteListe = await resListeFetch.json();
    
            const listePlat = jsonRequeteListe.results;
    
            for (let i = 0; i < listePlat.length; i++){
                platforms[listePlat[i].name] = listePlat[i].image.icon_url; 
            }
        
        } while (offset + jsonRequeteListe.number_of_page_results < jsonRequeteListe.number_of_total_results);

        this.globalPlatforms = platforms;
    
        return platforms;
    }

    static async fetchGameList(){

        const sectionPage = document.querySelector(".sectionPage");
    
        App.displayLoader(sectionPage);

        await this.loadPlatforms();
    
        const myInput = document.getElementById('searchInput').value;
    
        const fetchStr = `${this.API_URL}${this.API_GAMES}?api_key=${this.API_KEY}&${this.API_TO_JSON}&filter=name:${myInput}`;
    
        const resListeFetch = await fetch(fetchStr);
    
        const jsonRequeteListe = await resListeFetch.json();
    
        const listeJeux = jsonRequeteListe.results;
    
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
    
    
    }

    static mesJeuxEmpty(){
        return this.#mesJeux.size == 0;
    }
    
}

class Popup {
    static displayPopup(dansFav, sectionPage){
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
        };
    }
}

class ListeJeux {
    static generatePlatformHTML(gamePlatforms){
        let platforms_html = '<div>';
    
        let too_many_plats = false;

        let globalPlatforms = DAO.globalPlatforms;
    
        if (gamePlatforms != null) {
    
            for (let j = 0; j < gamePlatforms.length; j++){
    
                if (j >= 4){
                    let remaining = gamePlatforms.length - j;
                    platforms_html += `</div><a>+ ${remaining} autres</a>`;
                    too_many_plats = true;
                    break;
                }
    
                platforms_html += `<img src='${globalPlatforms[gamePlatforms[j].name]}' alt='${gamePlatforms[j].name}'
                                    title='${gamePlatforms[j].name}'>`;
            }
    
            if (!too_many_plats){
                platforms_html += '</div>';
            }
    
        } else {
            platforms_html += '<a> Aucune plateforme trouvée </a></div>';
        }
    
        return platforms_html;
    }
    
    
    
    static async displayFav(){
        const sectionPage = document.querySelector(".sectionPage");
        // Generate HTML from game list
    
        if (!DAO.mesJeuxEmpty()){
    
            App.displayLoader(App.sectionPage);
    
            await DAO.loadPlatforms();
            
            sectionPage.innerHTML = '';
    
            let currBigDiv;
    
            let i = 0;

            const mesJeux = DAO.getMesJeux();
    
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
    
    
    
    static displayGame(sectionPage, jeu){
        sectionPage.innerHTML = "";
    
        let gameDiv = document.createElement('div');
        gameDiv.classList.add("gamePage");
    
        let platforms_html = this.generatePlatformHTML(jeu.platforms);
    
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
    
        `;
    
        let addFavButton = document.createElement('button');
        addFavButton.classList.add("bouton");
        addFavButton.classList.add("addFavButton");
    
        const addToFav = "Ajouter aux favoris";
        const rmFromFav = "Retirer des favoris";
    
        addFavButton.innerHTML = DAO.jeuDansFavoris(jeu) ? rmFromFav : addToFav;
    
        addFavButton.onclick = () => {
            let dansFav = DAO.jeuDansFavoris(jeu);
            if (dansFav){
                DAO.retirerDesFavoris(jeu);
                addFavButton.innerHTML = addToFav;
            } else {
                DAO.ajouterAuxFavoris(jeu);
                addFavButton.innerHTML = rmFromFav;
            }
            Popup.displayPopup(dansFav, sectionPage);
        };
    
        gameDiv.append(addFavButton);
    
        sectionPage.append(gameDiv);
    
    }
}

class App {
    static sectionPage;
    static init() {
        this.sectionPage = document.querySelector(".sectionPage");
        if (!this.sectionPage) {
            throw new Error("sectionPage introuvable");
        }
        const searchButton = document.querySelector(".searchButton");
        if (!searchButton) {
            throw new Error("searchButton introuvable");
        }
        searchButton.addEventListener("click", DAO.fetchGameList.bind(DAO));
        
        const favButton = document.querySelector(".favButton");
        if (!favButton) {
            throw new Error("favButton introuvable");
        }
        favButton.addEventListener("click", ListeJeux.displayFav.bind(ListeJeux));

        const themeButton = document.querySelector(".themeButton");
        if (!themeButton) {
            throw new Error("themeButton introuvable");
        }
        themeButton.addEventListener("click", DAO.switchTheme.bind(DAO));

        DAO.chargerMesJeux();
        DAO.chargerThemeStocke();
        DAO.sauvegarderTheme();




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
                        };
                        reinit();
                        resolve(response);
                    };
        
                    document.querySelector('head').append(script);
                });
            };
        })();
    }

    static displayLoader(){
        this.sectionPage.innerHTML = "";
        const loader = document.createElement("div");
        loader.classList.add("loader");
        
        this.sectionPage.append(loader);
    }
}

window.onload = App.init.bind(App);
