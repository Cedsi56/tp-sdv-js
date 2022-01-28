import App from "./App";
import Jeu from "./Models/Jeu";

export default class DAO {

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
    
        let id = 0;
    
        do {
            offset += 100;
    
            const fetchStr = `${this.API_URL}${this.API_PLATFORMS}?api_key=${this.API_KEY}&${this.API_TO_JSON}&offset=${offset}`;
    
            const resListeFetch = await fetch(fetchStr);
    
            jsonRequeteListe = await resListeFetch.json();
    
            const listePlat = jsonRequeteListe.results;
    
            for (let i = 0; i < listePlat.length; i++){
                platforms[listePlat[i].name] = listePlat[i].image.icon_url; 
                id++;
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