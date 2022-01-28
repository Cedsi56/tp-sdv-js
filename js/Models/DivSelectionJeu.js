import ListeJeux from "../ListeJeux";

export default class DivSelectionJeu {
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