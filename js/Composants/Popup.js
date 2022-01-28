export default class Popup {
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
        }
    }
}