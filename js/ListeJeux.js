import DAO from './DAO';
import Popup from './Composants/Popup';
import App from './App';
import Jeu from './Models/Jeu';

export default class ListeJeux {
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
    
    
    
    static async displayFav(){
        const sectionPage = App.sectionPage;
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
    
                let jeu = new Jeu(unJeu, true);
        
                let newDiv = jeu.divCustom.div;
        
                currBigDiv.append(newDiv);
            });
        
    
        } else {
            sectionPage.innerHTML = `<div>
                                        <h2> C'est vide ici, ajoutez des favoris pour qu'ils apparaissent! </h2>
                                    </div>`;
        }
    
        
    }


    static async displayGameList(){
        const sectionPage = App.sectionPage;

        App.displayLoader(sectionPage);
    
        const listeJeux = await DAO.fetchGameList();
    
        // Generate HTML from game list
    
        sectionPage.innerHTML = '';
    
        let currBigDiv;
    
        for (let i = 0; i < listeJeux.length; i++){
    
            if (i%3 == 0){
                currBigDiv = document.createElement('div');
                currBigDiv.classList.add("multiGameDiv");
                sectionPage.append(currBigDiv);
            }
    
            let jeu = new Jeu(listeJeux[i]);
    
            let newDiv = jeu.divCustom.div;
    
            currBigDiv.append(newDiv);
    
        }
    }
    
    
    
    static displayGame(jeu){
        const sectionPage = App.sectionPage;

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
    
        `
    
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
            Popup.displayPopup(dansFav);
        }
    
        gameDiv.append(addFavButton);
    
        sectionPage.append(gameDiv);
    
    }
}