import ListeJeux from "./ListeJeux";
import DAO from "./DAO";


export default class App {
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
                        }
                        reinit();
                        resolve(response);
                    };
        
                    document.querySelector('head').append(script);
                });
            }
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